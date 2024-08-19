import { Code, CodeImpl } from "../code";
import { formatOptionsForLanguage } from "../format";
import { ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringifyObject } from "../utils";

type TypeRefTraits = {
  module?: string;
};

interface SwiftTypeRef extends TypeRef {
  module?: string;
  language: "swift";
}

export function typeRef(typeName: string, { module }: TypeRefTraits = {}): SwiftTypeRef {
  return {
    namespace: module ?? "",
    name: typeName,
    language: "swift",
    toString: () => typeName,
  };
}

export function dict<T extends object>(value: T): Code {
  const obj = stringifyObject(
    value,
    {
      objectTokens: ["[", "]"],
      arrayTokens: ["[", "]"],
      assignToken: ": ",
      formatKey: (key) => `"${key}"`,
      formatValue: (value) => {
        if (value === null || value === undefined) {
          return "nil";
        }
        if (typeof value === "string") {
          return `"${escapeStringQuotes(value)}"`;
        }
        if (typeof value === "number" || typeof value === "bigint") {
          return value.toString();
        }
        if (typeof value === "boolean") {
          return value ? "true" : "false";
        }
        throw new Error(`Unsupported value type: ${typeof value}`);
      },
    },
    formatOptionsForLanguage("swift"),
  );
  return CodeImpl.fromString(obj);
}

export function list<T extends object>(value: T[]): Code {
  return dict(value);
}

class SwiftImportResolver extends ImportResolver<SwiftTypeRef> {
  resolve(types: SwiftTypeRef[]): string {
    const packages = groupTypesByNamespace(types);
    const packageKeys = Object.keys(packages).sort();
    return packageKeys.map((packageName) => `import ${packageName}`).join("\n");
  }
}

export function imports(): ImportResolver {
  return new SwiftImportResolver();
}
