import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sidebar } from "@/components/compiler/sidebar";
import { EditorTabs } from "@/components/compiler/editor-tabs";
import { OutputPanel } from "@/components/compiler/output-panel";
import { MonacoEditor } from "@/components/ui/monaco-editor";
import { SpellCheckerSettings } from "@/components/ui/spell-checker-settings";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { Play, Code } from "lucide-react";
import { type LanguageKey, type CompilationJob } from "@shared/schema";
import { SpellChecker } from "@/lib/spell-checker";

interface FileTab {
  id: string;
  name: string;
  language: LanguageKey;
  content: string;
  isActive: boolean;
}



export default function Home() {
  const [files, setFiles] = useState<FileTab[]>([
    {
      id: "1",
      name: "main.py",
      language: "python",
      content: `# Python Online Compiler Example
import sys

def calculate_fibonacci(n):
    if n <= 1:
        return n
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

if __name__ == "__main__":
    num = 10
    result = calculate_fibonacci(num)
    print(f"Fibonacci of {num} is: {result}")
    
# Test spell checker with some misspelled words
def test_spell_checker():
    misspelled_variable = "This is a misspelled variabel"
    another_mistake = "Another misspeled word here"
    return misspelled_variable, another_mistake`,
      isActive: true
    }
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>("python");
  const [selectedVersion, setSelectedVersion] = useState("3.11");
  const [compilationResult, setCompilationResult] = useState<CompilationJob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showSpellCheckerSettings, setShowSpellCheckerSettings] = useState(false);
  const spellCheckerRef = useRef<SpellChecker | null>(null);

  const { toast } = useToast();
  const { theme } = useTheme();

  const activeFile = files.find(f => f.isActive);

  const compileMutation = useMutation({
    mutationFn: async (data: { language: string; version: string; code: string; fileName: string }) => {
      const response = await apiRequest("POST", "/api/compile", data);
      return response.json();
    },
    onSuccess: (result: CompilationJob) => {
      setCompilationResult(result);
      setIsCompiling(false);
      toast({
        title: result.status === "success" ? "Compilation Successful" : "Compilation Failed",
        description: result.status === "success" 
          ? `Executed in ${result.executionTime}` 
          : "Check the output panel for errors",
        variant: result.status === "success" ? "default" : "destructive"
      });
    },
    onError: (error) => {
      setIsCompiling(false);
      toast({
        title: "Compilation Error",
        description: error instanceof Error ? error.message : "Failed to compile code",
        variant: "destructive"
      });
    }
  });

  const handleCompile = () => {
    if (!activeFile) return;
    
    setIsCompiling(true);
    compileMutation.mutate({
      language: selectedLanguage,
      version: selectedVersion,
      code: activeFile.content,
      fileName: activeFile.name.split('.')[0]
    });
  };

  const handleCodeChange = (value: string) => {
    if (!activeFile) return;
    
    setFiles(prev => prev.map(file => 
      file.id === activeFile.id 
        ? { ...file, content: value }
        : file
    ));
  };

  const handleLanguageChange = (language: LanguageKey, version: string, fileName?: string) => {
    setSelectedLanguage(language);
    setSelectedVersion(version);
    
    // Update active file with new language and name if provided
    if (activeFile && fileName) {
      setFiles(prev => prev.map(file => 
        file.id === activeFile.id 
          ? { ...file, name: fileName, language, content: getDefaultCode(language) }
          : file
      ));
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();
      let language: LanguageKey = "python";
      
      if (extension === "java") language = "java";
      else if (extension === "c") language = "c";
      
      const newFile: FileTab = {
        id: Date.now().toString(),
        name: file.name,
        language,
        content,
        isActive: true
      };
      
      setFiles(prev => [
        ...prev.map(f => ({ ...f, isActive: false })),
        newFile
      ]);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewFile = (fileName?: string) => {
    if (fileName) {
      const newFile: FileTab = {
        id: Date.now().toString(),
        name: fileName,
        language: selectedLanguage,
        content: getDefaultCode(selectedLanguage),
        isActive: true
      };
      
      setFiles(prev => [
        ...prev.map(f => ({ ...f, isActive: false })),
        newFile
      ]);
    }
  };

  const handleSpellCheckerUpdate = () => {
    // Trigger a re-render of the editor to update spell checking
    const activeFile = files.find(f => f.isActive);
    if (activeFile) {
      setFiles(prev => [...prev]); // Force re-render
    }
  };

  const getDefaultCode = (language: LanguageKey): string => {
    switch (language) {
      case "python":
        return `# Python code
print("Hello, World!")`;
      case "java":
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
      case "c":
        return `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
      default:
        return "";
    }
  };

  return (
    <div className="h-screen bg-background dark:bg-editor-bg text-foreground dark:text-editor-text flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-card dark:bg-editor-surface border-b border-border dark:border-editor-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Code className="text-primary text-xl" />
            <h1 className="text-lg font-semibold text-foreground dark:text-white">Bit Benders</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4 ml-8">
            <span className="text-sm text-muted-foreground dark:text-editor-text">Real-time compilation with syntax checking</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCompiling ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-sm text-muted-foreground dark:text-editor-text">{isCompiling ? 'Compiling' : 'Ready'}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          selectedLanguage={selectedLanguage}
          selectedVersion={selectedVersion}
          onLanguageChange={handleLanguageChange}
          onFileUpload={handleFileUpload}
          onDownload={handleDownload}
          onNewFile={handleNewFile}
          spellChecker={spellCheckerRef.current}
          onSpellCheckerUpdate={handleSpellCheckerUpdate}
          showSpellCheckerSettings={showSpellCheckerSettings}
          onToggleSpellCheckerSettings={() => setShowSpellCheckerSettings(!showSpellCheckerSettings)}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <EditorTabs
            files={files}
            onFileSelect={(fileId) => {
              setFiles(prev => prev.map(f => ({ ...f, isActive: f.id === fileId })));
            }}
            onFileClose={(fileId) => {
              setFiles(prev => {
                const filtered = prev.filter(f => f.id !== fileId);
                if (filtered.length > 0 && prev.find(f => f.id === fileId)?.isActive) {
                  filtered[0].isActive = true;
                }
                return filtered;
              });
            }}

          />

          {/* Code Editor */}
          <div className="flex-1">
            {activeFile && (
              <MonacoEditor
                value={activeFile.content}
                language={activeFile.language}
                onChange={handleCodeChange}
                onSpellCheckerReady={(spellChecker) => {
                  spellCheckerRef.current = spellChecker;
                }}
              />
            )}
          </div>

          {/* Output Panel */}
          <OutputPanel
            compilationResult={compilationResult}
            isCompiling={isCompiling}
            onCompile={handleCompile}
            onClear={() => setCompilationResult(null)}
          />
        </div>
      </div>
    </div>
  );
}
