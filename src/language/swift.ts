import { Code, CodeImpl } from "../code";
import { ImportResolver, TypeRef } from "../types";
import { groupTypesByNamespace, stringifyObject } from "../utils";

type TypeRefTraits = {
  module?: string;
  alias?: string;
};

interface SwiftTypeRef extends TypeRef {
  module?: string;
  alias?: string;
  language: "swift";
}

export function typeRef(typeName: string, { module, alias }: TypeRefTraits): SwiftTypeRef {
  return {
    namespace: module ?? "",
    name: typeName,
    alias,
    language: "swift",
    toString: () => alias || typeName,
  };
}

export function dict<T extends object>(value: T): Code {
  const obj = stringifyObject(value, {
    objectTokens: ["[", "]"],
    arrayTokens: ["[", "]"],
    assignToken: ": ",
    formatKey: (key) => `"${key}"`,
    formatValue: (value) => {
      if (value === null || value === undefined) {
        return "nil";
      }
      if (typeof value === "string") {
        return `"${value}"`;
      }
      if (typeof value === "number") {
        return value.toString();
      }
      if (typeof value === "boolean") {
        return value ? "true" : "false";
      }
      throw new Error(`Unsupported value type: ${typeof value}`);
    },
  });
  return CodeImpl.fromString(obj);
}

export function list<T extends object>(value: T[]): Code {
  return dict(value);
}

class SwiftImportResolver extends ImportResolver<SwiftTypeRef> {
  resolve(types: SwiftTypeRef[]): string {
    const packages = groupTypesByNamespace(types);
    const packageKeys = Object.keys(packages).sort();
    const statements = packageKeys.flatMap((packageName) => {
      const types = packages[packageName].sort((a, b) => a.name.localeCompare(b.name));
      const typeNames = types.map((type) => (type.alias ? `${type.name} as ${type.alias}` : type.name));
      if (!packageName) {
        return typeNames.map((type) => `import ${type}`);
      }
      return `import ${packageName}.${typeNames.join(", ")}`;
    });
    return statements.join("\n");
  }
}

export function imports(): ImportResolver {
  return new SwiftImportResolver();
}
