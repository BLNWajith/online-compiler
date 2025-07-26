import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type LanguageKey, SUPPORTED_LANGUAGES } from '@shared/schema';

interface FileTab {
  id: string;
  name: string;
  language: LanguageKey;
  content: string;
  isActive: boolean;
}

interface EditorTabsProps {
  files: FileTab[];
  onFileSelect: (fileId: string) => void;
  onFileClose: (fileId: string) => void;
}

export function EditorTabs({ files, onFileSelect, onFileClose }: EditorTabsProps) {
  const getLanguageIcon = (language: LanguageKey) => {
    return SUPPORTED_LANGUAGES[language].icon;
  };

  return (
    <div className="bg-card dark:bg-editor-surface border-b border-border dark:border-editor-border px-4 py-2 flex items-center space-x-1">
      <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm border transition-colors cursor-pointer ${
              file.isActive
                ? 'bg-background dark:bg-editor-bg border-border dark:border-editor-border text-foreground dark:text-white'
                : 'bg-transparent border-transparent text-muted-foreground dark:text-editor-text hover:bg-accent dark:hover:bg-editor-bg/50'
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            <i className={`${getLanguageIcon(file.language)} text-xs`}></i>
            <span className="whitespace-nowrap">{String(file.name)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 w-4 h-4 text-muted-foreground dark:text-editor-text hover:text-foreground dark:hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(file.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

    </div>
  );
}
