export type CodeIndentOptions = {
  indentSize: number;
  indentChar: " " | "\t";
};

export type CodeFormatOptions = CodeIndentOptions & {
  stringQuote: '"' | "'";
};

export const TWO_SPACES: CodeFormatOptions = {
  indentSize: 2,
  indentChar: " ",
  stringQuote: '"',
};

export const FOUR_SPACES: CodeFormatOptions = {
  indentSize: 4,
  indentChar: " ",
  stringQuote: '"',
};

export const DEFAULT_FORMAT_OPTIONS = TWO_SPACES;

const LANGUAGE_OPTIONS: Record<string, Partial<CodeFormatOptions>> = {
  js: TWO_SPACES,
  python: FOUR_SPACES,
  swift: FOUR_SPACES,
  java: FOUR_SPACES,
  kotlin: FOUR_SPACES,
};

export function formatOptionsForLanguage(language?: string): CodeFormatOptions {
  return {
    ...DEFAULT_FORMAT_OPTIONS,
    ...(LANGUAGE_OPTIONS[language ?? ""] ?? {}),
  };
}
