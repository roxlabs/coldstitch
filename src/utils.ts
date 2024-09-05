import { CodeFormatOptions, CodeIndentOptions, DEFAULT_FORMAT_OPTIONS } from "./format";
import { TypeRef } from "./types";

type ObjectBoundaryTokens = [string, string];

export interface ObjectFormatter {
  objectTokens: ObjectBoundaryTokens;
  arrayTokens: ObjectBoundaryTokens;
  assignToken: string;
  formatKey(key: string): string;
  formatValue(value: any): string;
}

type IndentLevel = {
  indentLevel?: number;
};

type Reference = Record<string, any> | any[];

export function stringify(
  reference: Reference,
  formatter: ObjectFormatter,
  options: Partial<CodeFormatOptions> & IndentLevel = DEFAULT_FORMAT_OPTIONS,
): string {
  const isArray = Array.isArray(reference);
  const [startToken, endToken] = isArray ? formatter.arrayTokens : formatter.objectTokens;
  const {
    indentSize,
    indentChar,
    indentLevel = 0,
  } = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  };
  const indent = indentChar.repeat(indentSize * indentLevel);
  const childIndent = indentChar.repeat(indentSize * (indentLevel + 1));

  const processValue = (value: any, key?: string): string => {
    let formattedValue: string;

    if (Array.isArray(value)) {
      formattedValue = stringify(value, formatter, {
        ...options,
        indentLevel: indentLevel + 1,
      });
    } else if (isPlainObject(value)) {
      formattedValue = stringify(value, formatter, {
        ...options,
        indentLevel: indentLevel + 1,
      });
    } else if (typeof value === "function") {
      formattedValue = `"${value.name} function reference"`;
    } else {
      formattedValue = formatter.formatValue(value);
    }

    if (isArray) {
      return formattedValue;
    } else {
      const formattedKey = formatter.formatKey(key!);
      return `${formattedKey}${formatter.assignToken}${formattedValue}`;
    }
  };

  if (isArray) {
    const content = (reference as any[]).map((value) => processValue(value)).join(", ");
    return `${startToken}${content}${endToken}`;
  } else {
    const lines: string[] = [];
    for (const key in reference as Record<string, any>) {
      lines.push(processValue((reference as Record<string, any>)[key], key));
    }
    const content = lines.join(",\n" + childIndent);
    return `${startToken}\n${childIndent}${content}\n${indent}${endToken}`;
  }
}

export function createTemplateStringsArray(literals: string[]): TemplateStringsArray {
  const templateStringsArray = literals;
  Object.defineProperty(templateStringsArray, "raw", {
    value: literals,
  });
  return templateStringsArray as unknown as TemplateStringsArray;
}

export function resolveLineIndentation(line: string): CodeIndentOptions {
  let indentChar: "\t" | " " = " ";
  let indentSize: number = 0;

  if (line.startsWith("\t")) {
    indentChar = "\t";
    // force non-null is safe because we already checked if the line starts with a tab
    indentSize = line.match(/^\t+/)![0].length;
  }

  // Check if the line starts with a space
  if (line.startsWith(" ")) {
    indentChar = " ";
    // force non-null is safe because we already checked if the line starts with a space
    indentSize = line.match(/^ +/)![0].length;
  }

  return { indentChar, indentSize };
}

export function getLineIndentation(line: string): string {
  return /^(\s*)/.exec(line)?.[1] ?? "";
}

export function resolveIndentation(code: string): CodeIndentOptions {
  const lines = code.split("\n");

  const indentedLine = lines.find((line) => line.trimStart() !== line);
  if (!indentedLine) {
    // TODO better default per language. Ingerit from toCodeString options
    return { indentChar: " ", indentSize: 2 };
  }
  return resolveLineIndentation(indentedLine);
}

export function lastItem<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function groupTypesByNamespace<T extends TypeRef = TypeRef>(types: T[]): Record<string, T[]> {
  const packages: Record<string, T[]> = {};
  types.forEach((type) => {
    if (!packages[type.namespace]) {
      packages[type.namespace] = [];
    }
    packages[type.namespace].push(type);
  });
  return packages;
}

export function escapeStringQuotes(value: string, quoteChar: string = '"'): string {
  return value.replace(new RegExp(quoteChar, "g"), `\\${quoteChar}`);
}

export function isPlainObject(value: any): boolean {
  return value !== null && typeof value === "object" && value.constructor === Object;
}

export function isScalar(value: any): boolean {
  return value === null || (typeof value !== "object" && typeof value !== "function" && !Array.isArray(value));
}
