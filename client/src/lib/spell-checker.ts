import { type LanguageKey } from "@shared/schema";

// Import keyword files
import pythonKeywords from '@/constants/keywords/python.json';
import javaKeywords from '@/constants/keywords/java.json';
import cKeywords from '@/constants/keywords/c.json';

// Language-specific keyword mappings
const LANGUAGE_KEYWORDS = {
  python: [
    ...pythonKeywords.keywords,
    ...pythonKeywords.builtin_functions,
    ...pythonKeywords.common_libraries
  ],
  java: [
    ...javaKeywords.keywords,
    ...javaKeywords.builtin_classes,
    ...javaKeywords.common_methods,
    ...javaKeywords.common_libraries
  ],
  c: [
    ...cKeywords.keywords,
    ...cKeywords.builtin_functions,
    ...cKeywords.macros_and_constants,
    ...cKeywords.common_headers
  ]
};

// Common English words that might appear in programming contexts
const COMMON_WORDS = [
  'hello', 'world', 'test', 'example', 'demo', 'main', 'function', 'method', 'class',
  'object', 'value', 'result', 'output', 'input', 'data', 'file', 'name', 'text',
  'number', 'count', 'total', 'sum', 'average', 'max', 'min', 'first', 'last',
  'next', 'previous', 'current', 'temp', 'temporary', 'buffer', 'array', 'list',
  'item', 'element', 'index', 'key', 'value', 'pair', 'node', 'tree', 'graph',
  'table', 'row', 'column', 'field', 'record', 'database', 'query', 'search',
  'find', 'create', 'delete', 'update', 'insert', 'select', 'where', 'order',
  'group', 'having', 'join', 'inner', 'outer', 'left', 'right', 'union', 'all',
  'distinct', 'limit', 'offset', 'begin', 'end', 'start', 'stop', 'pause', 'resume',
  'save', 'load', 'read', 'write', 'open', 'close', 'connect', 'disconnect',
  'send', 'receive', 'request', 'response', 'client', 'server', 'host', 'port',
  'address', 'url', 'path', 'directory', 'folder', 'extension', 'format', 'type',
  'size', 'length', 'width', 'height', 'color', 'image', 'picture', 'photo',
  'video', 'audio', 'sound', 'music', 'voice', 'speech', 'language', 'code',
  'program', 'application', 'software', 'hardware', 'computer', 'machine', 'device',
  'system', 'platform', 'framework', 'library', 'module', 'package', 'import',
  'export', 'include', 'require', 'namespace', 'scope', 'global', 'local', 'public',
  'private', 'protected', 'static', 'dynamic', 'abstract', 'concrete', 'virtual',
  'override', 'implement', 'extend', 'inherit', 'constructor', 'destructor',
  'initialize', 'finalize', 'allocate', 'deallocate', 'memory', 'pointer', 'reference',
  'variable', 'constant', 'parameter', 'argument', 'return', 'yield', 'throw',
  'catch', 'finally', 'try', 'except', 'error', 'exception', 'warning', 'info',
  'debug', 'trace', 'log', 'message', 'text', 'string', 'character', 'digit',
  'letter', 'symbol', 'operator', 'expression', 'statement', 'block', 'loop',
  'condition', 'branch', 'switch', 'case', 'default', 'break', 'continue',
  'goto', 'label', 'comment', 'documentation', 'help', 'guide', 'tutorial',
  'manual', 'reference', 'specification', 'standard', 'protocol', 'format',
  'encoding', 'decoding', 'compression', 'encryption', 'decryption', 'hash',
  'checksum', 'validate', 'verify', 'authenticate', 'authorize', 'permission',
  'access', 'control', 'security', 'safety', 'performance', 'optimization',
  'efficiency', 'speed', 'time', 'space', 'complexity', 'algorithm', 'structure',
  'pattern', 'design', 'architecture', 'model', 'view', 'controller', 'service',
  'component', 'widget', 'control', 'button', 'menu', 'window', 'dialog', 'form',
  'field', 'label', 'textbox', 'checkbox', 'radio', 'dropdown', 'listbox',
  'tree', 'grid', 'table', 'chart', 'graph', 'plot', 'diagram', 'map', 'calendar',
  'date', 'time', 'timestamp', 'format', 'parse', 'convert', 'transform', 'filter',
  'sort', 'group', 'aggregate', 'calculate', 'compute', 'process', 'execute',
  'run', 'build', 'compile', 'link', 'deploy', 'install', 'uninstall', 'configure',
  'setup', 'initialize', 'cleanup', 'backup', 'restore', 'migrate', 'upgrade',
  'downgrade', 'patch', 'fix', 'repair', 'maintain', 'monitor', 'track', 'measure',
  'analyze', 'report', 'summary', 'detail', 'overview', 'status', 'state', 'mode',
  'option', 'setting', 'configuration', 'preference', 'default', 'custom', 'user',
  'admin', 'guest', 'anonymous', 'session', 'cookie', 'cache', 'storage', 'database',
  'table', 'index', 'constraint', 'trigger', 'procedure', 'function', 'view'
];

interface SpellError {
  word: string;
  startIndex: number;
  endIndex: number;
  line: number;
  column: number;
  suggestions?: string[];
}

export class SpellChecker {
  private validWords: Set<string>;
  private userDictionary: Set<string>;
  private ignoredWords: Set<string>;
  private language: LanguageKey;

  constructor(language: LanguageKey) {
    this.language = language;
    this.userDictionary = new Set();
    this.ignoredWords = new Set();
    
    this.validWords = new Set([
      ...LANGUAGE_KEYWORDS[language],
      ...COMMON_WORDS,
      ...this.generateCommonVariableNames(),
      ...this.userDictionary,
      ...this.ignoredWords
    ]);
  }

  // Add word to user dictionary
  public addToDictionary(word: string): void {
    this.userDictionary.add(word.toLowerCase());
    this.validWords.add(word.toLowerCase());
  }

  // Ignore word for current session
  public ignoreWord(word: string): void {
    this.ignoredWords.add(word.toLowerCase());
    this.validWords.add(word.toLowerCase());
  }

  // Get user dictionary
  public getUserDictionary(): string[] {
    return Array.from(this.userDictionary);
  }

  // Clear user dictionary
  public clearUserDictionary(): void {
    this.userDictionary.clear();
    this.rebuildValidWords();
  }

  private rebuildValidWords(): void {
    this.validWords = new Set([
      ...LANGUAGE_KEYWORDS[this.language],
      ...COMMON_WORDS,
      ...this.generateCommonVariableNames(),
      ...this.userDictionary,
      ...this.ignoredWords
    ]);
  }

  private generateCommonVariableNames(): string[] {
    const prefixes = ['get', 'set', 'is', 'has', 'can', 'should', 'will', 'create', 'update', 'delete', 'find', 'search'];
    const suffixes = ['name', 'value', 'data', 'info', 'result', 'output', 'input', 'text', 'number', 'count', 'list', 'array'];
    const combinations: string[] = [];
    
    prefixes.forEach(prefix => {
      suffixes.forEach(suffix => {
        combinations.push(prefix + suffix.charAt(0).toUpperCase() + suffix.slice(1));
      });
    });
    
    return combinations;
  }

  private isValidWord(word: string): boolean {
    // Check if it's a valid programming word
    if (this.validWords.has(word.toLowerCase())) {
      return true;
    }
    
    // Check if it's a number
    if (/^\d+$/.test(word) || /^\d*\.\d+$/.test(word)) {
      return true;
    }
    
    // Check if it's a common variable naming pattern (camelCase, snake_case)
    if (/^[a-z][a-zA-Z0-9]*$/.test(word) || /^[a-z][a-z0-9_]*$/.test(word)) {
      // For camelCase or snake_case, if it's short (< 3 chars) or very long (> 20 chars), it might be a typo
      if (word.length >= 3 && word.length <= 20) {
        return true;
      }
    }
    
    // Check if it's ALL_CAPS (constants)
    if (/^[A-Z][A-Z0-9_]*$/.test(word)) {
      return true;
    }
    
    // Check if it's a class name (PascalCase)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(word)) {
      return true;
    }
    
    return false;
  }

  public checkSpelling(code: string): SpellError[] {
    const errors: SpellError[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, lineIndex) => {
      // Extract words from the line, excluding strings, comments, and special characters
      const words = this.extractWords(line);
      
      words.forEach(({ word, startIndex }) => {
        if (!this.isValidWord(word)) {
          errors.push({
            word,
            startIndex,
            endIndex: startIndex + word.length,
            line: lineIndex + 1,
            column: startIndex + 1,
            suggestions: this.getSuggestions(word)
          });
        }
      });
    });
    
    return errors;
  }

  private extractWords(line: string): Array<{ word: string; startIndex: number }> {
    const words: Array<{ word: string; startIndex: number }> = [];
    
    // Remove strings and comments to avoid checking their content
    let cleanLine = line;
    
    // Remove string literals (simple approach - doesn't handle escaped quotes)
    cleanLine = cleanLine.replace(/"[^"]*"/g, '""');
    cleanLine = cleanLine.replace(/'[^']*'/g, "''");
    
    // Remove single-line comments
    cleanLine = cleanLine.replace(/\/\/.*$/, '');
    cleanLine = cleanLine.replace(/#.*$/, '');
    
    // Extract words (letters only, minimum 2 characters)
    const wordRegex = /[a-zA-Z]{2,}/g;
    let match;
    
    while ((match = wordRegex.exec(cleanLine)) !== null) {
      words.push({
        word: match[0],
        startIndex: match.index
      });
    }
    
    return words;
  }

  private getSuggestions(word: string): string[] {
    const suggestions: string[] = [];
    const lowerWord = word.toLowerCase();
    
    // Find close matches in valid words
    const validWordsArray = Array.from(this.validWords);
    const scoredSuggestions: Array<{ word: string; score: number }> = [];
    
    for (const validWord of validWordsArray) {
      const editDistance = this.calculateEditDistance(lowerWord, validWord);
      if (editDistance <= 3) {
        // Calculate a score based on edit distance and word similarity
        let score = 1 / (editDistance + 1);
        
        // Bonus for same length
        if (validWord.length === lowerWord.length) {
          score += 0.5;
        }
        
        // Bonus for same starting letter
        if (validWord[0] === lowerWord[0]) {
          score += 0.3;
        }
        
        // Bonus for programming-related words
        if (LANGUAGE_KEYWORDS[this.language].includes(validWord)) {
          score += 0.2;
        }
        
        scoredSuggestions.push({ word: validWord, score });
      }
    }
    
    // Sort by score and return top suggestions
    return scoredSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.word);
  }

  private calculateEditDistance(a: string, b: string): number {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i += 1) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= b.length; j += 1) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[a.length][b.length];
  }
}