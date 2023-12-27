import { Code, CodeImpl } from "../code";
import { ImportResolver, TypeRef } from "../types";
import { stringifyObject } from "../utils";

type TypeRefTraits = {
  module?: string;
  alias?: string;
};

interface PythonTypeRef extends TypeRef {
  module?: string;
  alias?: string;
  language: "python";
}

export function typeRef(typeName: string, { module, alias }: TypeRefTraits): PythonTypeRef {
  return {
    namespace: module ?? "",
    name: typeName,
    alias,
    language: "python",
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
        return "None";
      }
      if (typeof value === "string") {
        return `"${value}"`;
      }
      if (typeof value === "number") {
        return value.toString();
      }
      if (typeof value === "boolean") {
        return value ? "True" : "False";
      }
      throw new Error(`Unsupported value type: ${typeof value}`);
    },
  });
  return CodeImpl.fromString(obj);
}

export function list<T extends object>(value: T[]): Code {
  return dict(value);
}

class PythonImportResolver extends ImportResolver<PythonTypeRef> {
  resolve(types: PythonTypeRef[]): string {
    const packages: Record<string, PythonTypeRef[]> = {};
    types.forEach((type) => {
      if (!type.namespace) {
        return;
      }
      if (!packages[type.namespace]) {
        packages[type.namespace] = [];
      }
      packages[type.namespace].push(type);
    });

    const orderedPackages = Object.keys(packages).sort();
    const statements = orderedPackages.flatMap((packageName) => {
      const types = packages[packageName].sort((a, b) => a.name.localeCompare(b.name));
      const typeNames = types.map((type) => (type.alias ? `${type.name} as ${type.alias}` : type.name));
      if (!packageName) {
        return typeNames.map((type) => `import ${type}`);
      }
      return `from ${packageName} import ${typeNames.join(", ")}`;
    });
    return statements.join("\n");
  }
}

export function imports(): ImportResolver {
  return new PythonImportResolver();
}
