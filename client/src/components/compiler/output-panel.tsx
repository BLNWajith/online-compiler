import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Terminal, Bug, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { type CompilationJob } from '@shared/schema';

interface OutputPanelProps {
  compilationResult: CompilationJob | null;
  isCompiling: boolean;
  onCompile: () => void;
  onClear: () => void;
}

export function OutputPanel({ compilationResult, isCompiling, onCompile, onClear }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'console' | 'debug'>('output');

  const getStatusIcon = () => {
    if (isCompiling) return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    if (!compilationResult) return <Terminal className="w-4 h-4" />;
    if (compilationResult.status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isCompiling) return 'Compiling...';
    if (!compilationResult) return 'Ready to compile';
    if (compilationResult.status === 'success') return 'Compilation successful';
    return 'Compilation failed';
  };

  const renderOutput = () => {
    if (isCompiling) {
      return (
        <div className="space-y-1">
          <div className="text-yellow-400">Compiling your code...</div>
          <div className="text-editor-text text-xs">Please wait while we process your request.</div>
        </div>
      );
    }

    if (!compilationResult) {
      return (
        <div className="space-y-1">
          <div className="text-editor-text">Click "Run Code" to compile and execute your program.</div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div className={`text-sm ${
            compilationResult.status === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {getStatusText()}
          </div>
        </div>
        
        {compilationResult.status === 'success' && compilationResult.output && (
          <>
            <div className="text-white whitespace-pre-wrap font-mono">
              {compilationResult.output}
            </div>
            {compilationResult.executionTime && (
              <div className="text-editor-text text-xs mt-2">
                Execution completed in {compilationResult.executionTime}
              </div>
            )}
          </>
        )}
        
        {compilationResult.status === 'error' && compilationResult.errors && (
          <div className="text-red-400 whitespace-pre-wrap font-mono">
            {typeof compilationResult.errors === 'string' 
              ? compilationResult.errors 
              : (compilationResult.errors as Record<string, any>)?.message || 'Compilation error occurred'
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-64 bg-card dark:bg-editor-surface border-t border-border dark:border-editor-border flex flex-col">
      {/* Output Tabs */}
      <div className="flex items-center border-b border-border dark:border-editor-border">
        <button
          className={`px-4 py-2 text-sm font-medium border-r border-border dark:border-editor-border transition-colors ${
            activeTab === 'output'
              ? 'text-foreground dark:text-white bg-background dark:bg-editor-bg'
              : 'text-muted-foreground dark:text-editor-text hover:text-foreground dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('output')}
        >
          <Play className="w-4 h-4 mr-2 inline" />
          Output
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-r border-border dark:border-editor-border transition-colors ${
            activeTab === 'console'
              ? 'text-foreground dark:text-white bg-background dark:bg-editor-bg'
              : 'text-muted-foreground dark:text-editor-text hover:text-foreground dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('console')}
        >
          <Terminal className="w-4 h-4 mr-2 inline" />
          Console
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'debug'
              ? 'text-foreground dark:text-white bg-background dark:bg-editor-bg'
              : 'text-muted-foreground dark:text-editor-text hover:text-foreground dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('debug')}
        >
          <Bug className="w-4 h-4 mr-2 inline" />
          Debug
        </button>
        <div className="flex-1" />
        <div className="px-4 py-2 flex items-center space-x-2">
          <Button
            onClick={onCompile}
            disabled={isCompiling}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm font-medium"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isCompiling ? 'Compiling...' : 'Run Code'}
          </Button>
          <Button
            onClick={onClear}
            variant="secondary"
            className="bg-secondary dark:bg-editor-border hover:bg-secondary/80 dark:hover:bg-gray-600 text-secondary-foreground dark:text-white px-3 py-1.5"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-auto bg-background dark:bg-editor-bg font-mono text-sm editor-scrollbar">
        {activeTab === 'output' && renderOutput()}
        {activeTab === 'console' && (
          <div className="text-muted-foreground dark:text-editor-text">
            Console output will appear here...
          </div>
        )}
        {activeTab === 'debug' && (
          <div className="text-muted-foreground dark:text-editor-text">
            Debug information will appear here...
          </div>
        )}
      </div>
    </div>
  );
}
