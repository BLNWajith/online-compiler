import { useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { setupMonaco } from '@/lib/monaco-setup';
import { useTheme } from '@/contexts/theme-context';
import { SpellChecker } from '@/lib/spell-checker';
import { type LanguageKey } from '@shared/schema';



interface MonacoEditorProps {
  value: string;
  language: LanguageKey;
  onChange: (value: string) => void;
  onSpellCheckerReady?: (spellChecker: SpellChecker) => void;
}

export function MonacoEditor({ value, language, onChange, onSpellCheckerReady }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const spellCheckerRef = useRef<SpellChecker | null>(null);
  const spellCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Monaco if not already done
    setupMonaco();

    // Initialize spell checker for the current language
    spellCheckerRef.current = new SpellChecker(language);
    
    // Notify parent component about spell checker
    if (onSpellCheckerReady && spellCheckerRef.current) {
      onSpellCheckerReady(spellCheckerRef.current);
    }

    // Determine theme based on current theme context
    const monacoTheme = theme === 'dark' ? 'vs-dark-custom' : 'vs-light-custom';

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language: getMonacoLanguage(language),
      theme: monacoTheme,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      renderLineHighlight: 'line',
      cursorStyle: 'line',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      mouseWheelZoom: true,
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
    });

    // Listen for content changes
    const disposable = editorRef.current.onDidChangeModelContent(() => {
      if (editorRef.current) {
        const newValue = editorRef.current.getValue();
        onChange(newValue);
        
        // Debounced spell checking
        if (spellCheckTimeoutRef.current) {
          clearTimeout(spellCheckTimeoutRef.current);
        }
        spellCheckTimeoutRef.current = setTimeout(() => {
          performSpellCheck(newValue);
        }, 500); // 500ms delay
      }
    });

    // Add context menu for spell checker
    const contextMenuDisposable = editorRef.current.onContextMenu((e) => {
      const position = e.event.pos;
      const modelPosition = editorRef.current!.getPosition();
      if (!modelPosition) return;

      const model = editorRef.current!.getModel();
      if (!model) return;

      // Get word at cursor position
      const wordInfo = model.getWordAtPosition(modelPosition);
      if (!wordInfo) return;

      const word = wordInfo.word;
      
      // Check if this word has spell errors
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const spellMarkers = markers.filter(marker => 
        marker.source === 'spell-checker' && 
        marker.startLineNumber === modelPosition.lineNumber &&
        marker.startColumn <= modelPosition.column &&
        marker.endColumn >= modelPosition.column
      );

      if (spellMarkers.length > 0) {
        const marker = spellMarkers[0];
        const suggestions = marker.relatedInformation?.map(info => info.message.replace('Suggestion: ', '')) || [];
        
        // Create context menu items
        const contextMenuItems: monaco.IAction[] = [];
        
        if (suggestions.length > 0) {
          suggestions.forEach(suggestion => {
            contextMenuItems.push({
              id: `spell-suggest-${suggestion}`,
              label: `Replace with "${suggestion}"`,
              run: () => {
                const range = {
                  startLineNumber: marker.startLineNumber,
                  endLineNumber: marker.endLineNumber,
                  startColumn: marker.startColumn,
                  endColumn: marker.endColumn
                };
                editorRef.current!.executeEdits('spell-checker', [{
                  range,
                  text: suggestion
                }]);
              }
            });
          });
        }
        
        contextMenuItems.push(
          {
            id: 'spell-ignore',
            label: 'Ignore word',
            run: () => {
              if (spellCheckerRef.current) {
                spellCheckerRef.current.ignoreWord(word);
                performSpellCheck(editorRef.current!.getValue());
              }
            }
          },
          {
            id: 'spell-add-dictionary',
            label: 'Add to dictionary',
            run: () => {
              if (spellCheckerRef.current) {
                spellCheckerRef.current.addToDictionary(word);
                performSpellCheck(editorRef.current!.getValue());
              }
            }
          }
        );

        // Show custom context menu
        monaco.editor.trigger('spell-checker', 'editor.action.showContextMenu', {
          actions: contextMenuItems,
          anchor: position
        });
      }
    });

    // Initial spell check
    if (value) {
      performSpellCheck(value);
    }

    return () => {
      disposable.dispose();
      contextMenuDisposable?.dispose();
      if (spellCheckTimeoutRef.current) {
        clearTimeout(spellCheckTimeoutRef.current);
      }
      editorRef.current?.dispose();
    };
  }, []);

  const performSpellCheck = useCallback((code: string) => {
    if (!editorRef.current || !spellCheckerRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Get spell check errors
    const spellErrors = spellCheckerRef.current.checkSpelling(code);
    
    // Convert spell errors to Monaco markers
    const markers = spellErrors.map(error => ({
      startLineNumber: error.line,
      endLineNumber: error.line,
      startColumn: error.column,
      endColumn: error.column + error.word.length,
      message: `Possible misspelling: "${error.word}"${error.suggestions && error.suggestions.length > 0 ? `. Suggestions: ${error.suggestions.slice(0, 3).join(', ')}` : ''}`,
      severity: monaco.MarkerSeverity.Warning,
      source: 'spell-checker',
      code: 'spell-checker',
      relatedInformation: error.suggestions ? error.suggestions.map(suggestion => ({
        message: `Suggestion: ${suggestion}`,
        resource: model.uri,
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + error.word.length
      })) : undefined
    }));

    // Set markers (this will show red underlines)
    monaco.editor.setModelMarkers(model, 'spell-checker', markers);
  }, [language]);

  // Update theme when theme context changes
  useEffect(() => {
    if (editorRef.current) {
      const monacoTheme = theme === 'dark' ? 'vs-dark-custom' : 'vs-light-custom';
      monaco.editor.setTheme(monacoTheme);
    }
  }, [theme]);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
        
        // Update spell checker for new language
        spellCheckerRef.current = new SpellChecker(language);
        
        // Re-run spell check with new language
        if (editorRef.current) {
          performSpellCheck(editorRef.current.getValue());
        }
      }
    }
  }, [language, performSpellCheck]);



  const getMonacoLanguage = (lang: LanguageKey): string => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'c':
        return 'c';
      default:
        return 'plaintext';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-background dark:bg-editor-bg"
      style={{ minHeight: '300px' }}
    />
  );
}
