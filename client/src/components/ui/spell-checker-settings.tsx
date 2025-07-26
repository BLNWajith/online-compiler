import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Settings } from 'lucide-react';
import { SpellChecker } from '@/lib/spell-checker';

interface SpellCheckerSettingsProps {
  spellChecker: SpellChecker | null;
  onDictionaryUpdate?: () => void;
}

export function SpellCheckerSettings({ spellChecker, onDictionaryUpdate }: SpellCheckerSettingsProps) {
  const [newWord, setNewWord] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const handleAddWord = () => {
    if (newWord.trim() && spellChecker) {
      spellChecker.addToDictionary(newWord.trim());
      setNewWord('');
      onDictionaryUpdate?.();
    }
  };

  const handleRemoveWord = (word: string) => {
    if (spellChecker) {
      // Note: This would require extending the SpellChecker to support removal
      // For now, we'll just trigger a rebuild
      onDictionaryUpdate?.();
    }
  };

  const handleClearDictionary = () => {
    if (spellChecker) {
      spellChecker.clearUserDictionary();
      onDictionaryUpdate?.();
    }
  };

  const userDictionary = spellChecker?.getUserDictionary() || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Spell Checker Settings
        </CardTitle>
        <CardDescription>
          Manage spell checker preferences and custom dictionary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Spell Checker */}
        <div className="flex items-center justify-between">
          <Label htmlFor="spell-checker-enabled">Enable Spell Checker</Label>
          <Switch
            id="spell-checker-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>

        {/* Add Word to Dictionary */}
        <div className="space-y-2">
          <Label htmlFor="new-word">Add Word to Dictionary</Label>
          <div className="flex gap-2">
            <Input
              id="new-word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter a word..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <Button size="sm" onClick={handleAddWord} disabled={!newWord.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Dictionary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom Dictionary ({userDictionary.length} words)</Label>
            {userDictionary.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearDictionary}>
                Clear All
              </Button>
            )}
          </div>
          <div className="max-h-32 overflow-y-auto border rounded-md p-2">
            {userDictionary.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom words added yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {userDictionary.map((word) => (
                  <Badge key={word} variant="secondary" className="text-xs">
                    {word}
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spell Checker Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Red underlines indicate potential spelling errors</p>
          <p>• Right-click on underlined words for suggestions</p>
          <p>• Programming keywords are automatically recognized</p>
          <p>• Variable names in camelCase and snake_case are supported</p>
        </div>
      </CardContent>
    </Card>
  );
} 