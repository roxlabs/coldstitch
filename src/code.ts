import { CodeFormatOptions, formatOptionsForLanguage } from "./format";
import { ImportResolver, TypeRef, isTypeRef } from "./types";
import { createTemplateStringsArray, getLineIndentation, lastItem } from "./utils";

const omitLineSymbol = Symbol("omitLine");

const OMIT_LINE_TOKEN = "__COLDSNIP_OMIT_LINE__";

/**
 * A symbol that can be used in a code template to indicate that the line should be omitted.
 * Useful when doing logic that may or not include a line in the output.
 *
 * ```ts
 * const code = code`
 *   ${isStrict ? "'useStrict';" : omitLine()}
 *   console.log("Hello, world!");
 * `;
 *
 * @returns symbol that omits the line when present.
 */
export function omitLine() {
  return omitLineSymbol;
}

/**
 * The interface that represents a code template public API.
 */
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

  private resolveNestedCode(code: Code, currentIndent: string, options: CodeFormatOptions): string {
    const codeString = code.toCodeString(options);
    const lines = codeString.split("\n");
    const firstLine = lines.shift() ?? "";
    const rest = lines.map((line) => currentIndent + line).join("\n");
    return firstLine + "\n" + rest;
  }

  private resolveValues(options: CodeFormatOptions): any[] {
    const imports = this.imports;

    const resolveValue = (value: any, index: number): any => {
      if (value instanceof ImportResolver) {
        return value.resolve(imports);
      }
      if (value === omitLineSymbol) {
        // TODO: we could improve this by actually manipulating the literals to remove
        // the content that represents the omitted line, but for now it just adds a token
        // to the line that indicates it should be filtered out later
        return OMIT_LINE_TOKEN;
      }
      if (value instanceof CodeImpl) {
        // get the line right before the value interpolation and resolve its indentation
        const currentLine = lastItem(this.literals[index]?.split("\n") ?? []) ?? "";
        const currentIndent = getLineIndentation(currentLine);
        return this.resolveNestedCode(value, currentIndent, options).trim();
      }
      if (Array.isArray(value)) {
        return value.map((item) => resolveValue(item, index)).join("\n");
      }
      if (isTypeRef(value)) {
        return value.toString();
      }
      if (value === false || value === undefined) {
        return "";
      }
      return value;
    };

    return this.values.map(resolveValue);
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
      .filter((line) => line.includes(OMIT_LINE_TOKEN) === false)
      .map((line) => (line.startsWith(unindent) ? line.substring(unindent.length).trimEnd() : line))
      .join("\n")
      .trim();
  }
}

/**
 * A tagged template literal that represents code templates.
 *
 * ```ts
 * const code = code`
 *   console.log("hello coldsnip!");
 * `;
 *
 * @param literals The template literals.
 * @param values The values to interpolate.
 * @returns a `Code` instance that can be serialized to string using `toCodeString` or `toString`.
 */
export function code(literals: TemplateStringsArray, ...values: any[]): Code {
  return new CodeImpl(literals, values);
}
