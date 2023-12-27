export type CodeIndentOptions = {
  indentSize: number;
  indentChar: " " | "\t";
};

export type CodeFormatOptions = CodeIndentOptions & {
  stringQuote: '"' | "'";
};

export const DEFAULT_FORMAT_OPTIONS: CodeFormatOptions = {
  indentSize: 2,
  indentChar: " ",
  stringQuote: '"',
};

const LANGUAGE_OPTIONS: Record<string, Partial<CodeFormatOptions>> = {
  python: {
    indentSize: 4,
    indentChar: " ",
    stringQuote: '"',
  },
  js: {
    indentSize: 2,
    indentChar: " ",
    stringQuote: '"',
  },
};

export function formatOptionsForLanguage(language?: string): CodeFormatOptions {
  return {
    ...DEFAULT_FORMAT_OPTIONS,
    ...(LANGUAGE_OPTIONS[language ?? ""] ?? {}),
  };
}
