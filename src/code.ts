import { CodeFormatOptions, formatOptionsForLanguage } from "./format";
import { ImportResolver, TypeRef, isTypeRef } from "./types";
import {
  createTemplateStringsArray,
  getLineIndentation,
  lastItem,
} from "./utils";

export interface Code {
  readonly imports: TypeRef[];
  toString(): string;
  toCodeString(options?: CodeFormatOptions): string;
}

export class CodeImpl implements Code {
  private literals: TemplateStringsArray;
  private values: any[];

  constructor(literals: TemplateStringsArray, values: any[] = []) {
    this.literals = literals;
    this.values = values;
  }

  static fromString(value: string): Code {
    return new CodeImpl(createTemplateStringsArray([value]));
  }

  get imports(): TypeRef[] {
    const imports: TypeRef[] = [];
    this.values.forEach((value) => {
      if (isTypeRef(value)) {
        imports.push(value);
      }
    });
    return imports;
  }

  private resolveNestedCode(
    code: Code,
    currentIndent: string,
    options: CodeFormatOptions,
  ): string {
    const codeString = code.toCodeString(options);
    const lines = codeString.split("\n");
    const firstLine = lines.shift() ?? "";
    const rest = lines.map((line) => currentIndent + line).join("\n");
    return firstLine + "\n" + rest;
  }

  private resolveValues(options: CodeFormatOptions): any[] {
    const imports = this.imports;
    return this.values.map((value, index) => {
      if (value instanceof ImportResolver) {
        return value.resolve(imports);
      }
      if (value instanceof CodeImpl) {
        // get the line right before the value interpolation and resolve its indentation
        const currentLine =
          lastItem(this.literals[index]?.split("\n") ?? []) ?? "";
        const currentIndent = getLineIndentation(currentLine);
        return this.resolveNestedCode(value, currentIndent, options);
      }
      if (isTypeRef(value)) {
        return value.toString();
      }
      if (value === false || value === undefined) {
        return "";
      }
      return value;
    });
  }

  private get unindent(): string {
    const first = this.literals[0];
    const firstLine = first.startsWith("\n") ? first.slice(1) : first;
    return getLineIndentation(firstLine);
  }

  toString(): string {
    return this.toCodeString();
  }

  toCodeString(options?: CodeFormatOptions): string {
    const language = this.imports[0]?.language;
    const formatOptions = options ?? formatOptionsForLanguage(language);

    const unindent = this.unindent;
    const resolvedValues = this.resolveValues(formatOptions);
    return String.raw(this.literals, ...resolvedValues)
      .split("\n")
      .map((line) => line.substring(unindent.length).trimEnd())
      .join("\n")
      .trim();
  }
}

export function code(literals: TemplateStringsArray, ...values: any[]): Code {
  return new CodeImpl(literals, values);
}
