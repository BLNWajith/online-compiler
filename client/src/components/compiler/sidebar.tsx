import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileNameDialog } from '@/components/ui/file-name-dialog';
import { SpellCheckerSettings } from '@/components/ui/spell-checker-settings';
import { FileUp, Download, Plus, Settings } from 'lucide-react';
import { type LanguageKey, SUPPORTED_LANGUAGES } from '@shared/schema';
import { SpellChecker } from '@/lib/spell-checker';

interface SidebarProps {
  selectedLanguage: LanguageKey;
  selectedVersion: string;
  onLanguageChange: (language: LanguageKey, version: string, fileName?: string) => void;
  onFileUpload: (file: File) => void;
  onDownload: () => void;
  onNewFile: (fileName?: string) => void;
  spellChecker?: SpellChecker | null;
  onSpellCheckerUpdate?: () => void;
  showSpellCheckerSettings?: boolean;
  onToggleSpellCheckerSettings?: () => void;
}

export function Sidebar({
  selectedLanguage,
  selectedVersion,
  onLanguageChange,
  onFileUpload,
  onDownload,
  onNewFile,
  spellChecker,
  onSpellCheckerUpdate,
  showSpellCheckerSettings = false,
  onToggleSpellCheckerSettings
}: SidebarProps) {
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<{ language: LanguageKey; version: string } | null>(null);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.java,.c,.cpp,.h';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileUpload(file);
      }
    };
    input.click();
  };

  const handleLanguageSelect = (language: string) => {
    const langKey = language as LanguageKey;
    const defaultVersion = SUPPORTED_LANGUAGES[langKey].versions[0];
    
    setPendingLanguage({ language: langKey, version: defaultVersion });
    setShowLanguageDialog(true);
  };

  const handleVersionSelect = (version: string) => {
    onLanguageChange(selectedLanguage, version);
  };

  const handleNewFile = () => {
    setShowNewFileDialog(true);
  };

  const handleNewFileConfirm = (fileName: string) => {
    onNewFile(fileName);
  };

  const handleLanguageFileConfirm = (fileName: string) => {
    if (pendingLanguage) {
      onLanguageChange(pendingLanguage.language, pendingLanguage.version, fileName);
      setPendingLanguage(null);
    }
  };

  return (
    <aside className="w-80 bg-card dark:bg-editor-surface border-r border-border dark:border-editor-border flex flex-col">
      {/* Language & Version Selection */}
      <div className="p-4 border-b border-border dark:border-editor-border">
        <h3 className="text-sm font-medium text-foreground dark:text-white mb-3">Language & Version</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground dark:text-editor-text mb-1">Language</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageSelect}>
              <SelectTrigger className="w-full bg-background dark:bg-editor-bg border-border dark:border-editor-border text-foreground dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-editor-surface border-border dark:border-editor-border">
                {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                  <SelectItem key={key} value={key} className="text-foreground dark:text-white hover:bg-accent dark:hover:bg-editor-bg">
                    <div className="flex items-center space-x-2">
                      <i className={lang.icon} />
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground dark:text-editor-text mb-1">Version</label>
            <Select value={selectedVersion} onValueChange={handleVersionSelect}>
              <SelectTrigger className="w-full bg-background dark:bg-editor-bg border-border dark:border-editor-border text-foreground dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover dark:bg-editor-surface border-border dark:border-editor-border">
                {SUPPORTED_LANGUAGES[selectedLanguage].versions.map(version => (
                  <SelectItem key={version} value={version} className="text-foreground dark:text-white hover:bg-accent dark:hover:bg-editor-bg">
                    {SUPPORTED_LANGUAGES[selectedLanguage].name} {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* File Operations */}
      <div className="p-4 border-b border-border dark:border-editor-border">
        <h3 className="text-sm font-medium text-foreground dark:text-white mb-3">File Operations</h3>
        <div className="space-y-2">
          <Button 
            onClick={handleNewFile}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New File
          </Button>
          <Button 
            onClick={handleFileUpload}
            variant="secondary"
            className="w-full bg-secondary dark:bg-editor-border hover:bg-secondary/80 dark:hover:bg-gray-600 text-secondary-foreground dark:text-white"
            size="sm"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button 
            onClick={onDownload}
            variant="secondary"
            className="w-full bg-secondary dark:bg-editor-border hover:bg-secondary/80 dark:hover:bg-gray-600 text-secondary-foreground dark:text-white"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Spell Checker Settings */}
      <div className="p-4 border-b border-border dark:border-editor-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground dark:text-white">Spell Checker</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSpellCheckerSettings}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        {showSpellCheckerSettings && (
          <SpellCheckerSettings
            spellChecker={spellChecker}
            onDictionaryUpdate={onSpellCheckerUpdate}
          />
        )}
      </div>

      

      {/* File Name Dialogs */}
      <FileNameDialog
        isOpen={showNewFileDialog}
        onOpenChange={setShowNewFileDialog}
        onConfirm={handleNewFileConfirm}
        language={selectedLanguage}
        title="Create New File"
        description="Enter a name for your new file"
      />

      <FileNameDialog
        isOpen={showLanguageDialog}
        onOpenChange={setShowLanguageDialog}
        onConfirm={handleLanguageFileConfirm}
        language={pendingLanguage?.language || selectedLanguage}
        title="Change Language"
        description={`Enter a file name for ${pendingLanguage?.language || selectedLanguage}`}
      />
    </aside>
  );
}
