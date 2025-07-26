import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { type LanguageKey } from "@shared/schema";

interface FileNameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (fileName: string) => void;
  language: LanguageKey;
  title?: string;
  description?: string;
}

export function FileNameDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  language,
  title = "Create New File",
  description = "Enter a name for your new file"
}: FileNameDialogProps) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const getDefaultExtension = (lang: LanguageKey): string => {
    switch (lang) {
      case 'python':
        return '.py';
      case 'java':
        return '.java';
      case 'c':
        return '.c';
      default:
        return '.txt';
    }
  };

  const validateFileName = (name: string): string | null => {
    if (!name.trim()) {
      return "File name cannot be empty";
    }
    
    if (name.includes('/') || name.includes('\\')) {
      return "File name cannot contain slashes";
    }
    
    if (name.includes('<') || name.includes('>') || name.includes(':') || 
        name.includes('"') || name.includes('|') || name.includes('?') || name.includes('*')) {
      return "File name contains invalid characters";
    }
    
    return null;
  };

  const handleConfirm = () => {
    const validationError = validateFileName(fileName);
    if (validationError) {
      setError(validationError);
      return;
    }

    let finalFileName = fileName.trim();
    const defaultExt = getDefaultExtension(language);
    
    // Add extension if not present
    if (!finalFileName.includes('.')) {
      finalFileName += defaultExt;
    }
    
    onConfirm(finalFileName);
    onOpenChange(false);
    setFileName("");
    setError("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFileName("");
    setError("");
  };

  // Set default file name when dialog opens
  useEffect(() => {
    if (isOpen && !fileName) {
      setFileName(`main${getDefaultExtension(language)}`);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File Name
          </label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setError("");
            }}
            placeholder={`main${getDefaultExtension(language)}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            autoFocus
          />
          {error && (
            <div className="text-sm text-red-500 mt-1">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm}
            className="px-4 py-2"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}