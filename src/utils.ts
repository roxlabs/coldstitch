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

export function stringifyObject(
  object: Record<string, any>,
  formatter: ObjectFormatter,
  options: Partial<CodeFormatOptions> & IndentLevel = DEFAULT_FORMAT_OPTIONS,
): string {
  const [startToken, endToken] = formatter.objectTokens;
  const {
    indentSize,
    indentChar,
    indentLevel = 0,
  } = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  };
  let indent = indentChar.repeat(indentSize * indentLevel);
  let childIndent = indentChar.repeat(indentSize * (indentLevel + 1));
  let lines: string[] = [];

  for (let key in object) {
    const formattedKey = formatter.formatKey(key);
    let value = object[key];
    let formattedValue;

    if (Array.isArray(value)) {
      const [arrayStartToken, arrayEndToken] = formatter.arrayTokens;
      formattedValue = `${arrayStartToken}${value
        .map((value) =>
          typeof value === "object"
            ? stringifyObject(value, formatter, {
                ...options,
                indentLevel: indentLevel + 1,
              })
            : formatter.formatValue(value),
        )
        .join(", ")}${arrayEndToken}`;
    } else if (typeof value === "object" && value !== null) {
      formattedValue = stringifyObject(value, formatter, {
        ...options,
        indentLevel: indentLevel + 1,
      });
    } else if (typeof value === "function") {
      formattedValue = `"${value.name} function reference"`;
    } else {
      formattedValue = formatter.formatValue(value);
    }
    lines.push(`${formattedKey}${formatter.assignToken}${formattedValue}`);
  }

  return `${startToken}\n${childIndent}${lines.join(",\n" + childIndent)}\n${indent}${endToken}`;
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
