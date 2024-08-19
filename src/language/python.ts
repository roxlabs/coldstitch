import { Code, CodeImpl } from "../code";
import { formatOptionsForLanguage } from "../format";
import { CustomFormatter, ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringifyObject } from "../utils";

type TypeRefTraits = {
  from?: string;
  alias?: string;
};

interface PythonTypeRef extends TypeRef {
  module?: string;
  alias?: string;
  language: "python";
}

export function typeRef(typeName: string, { from: module, alias }: TypeRefTraits = {}): PythonTypeRef {
  return {
    namespace: module ?? "",
    name: typeName,
    alias,
    language: "python",
    toString: () => alias || typeName,
  };
}

type DictOptions = {
  formatter?: CustomFormatter;
};

export function dict<T extends object>(value: T, options: DictOptions = {}): Code {
  const { formatter } = options;
  const obj = stringifyObject(
    value,
    {
      objectTokens: ["{", "}"],
      arrayTokens: ["[", "]"],
      assignToken: ": ",
      formatKey: (key) => `"${key}"`,
      formatValue: (value) => {
        if (formatter) {
          const formatted = formatter(value);
          if (formatted !== undefined) {
            return formatted;
          }
        }
        if (value === null || value === undefined) {
          return "None";
        }
        if (typeof value === "string") {
          return `"${escapeStringQuotes(value)}"`;
        }
        if (typeof value === "number" || typeof value === "bigint") {
          return value.toString();
        }
        if (typeof value === "boolean") {
          return value ? "True" : "False";
        }
        throw new Error(`Unsupported value type: ${typeof value}`);
      },
    },
    formatOptionsForLanguage("python"),
  );
  return CodeImpl.fromString(obj);
}

export function list<T extends object>(value: T[]): Code {
  return dict(value);
}

class PythonImportResolver extends ImportResolver<PythonTypeRef> {
  resolve(types: PythonTypeRef[]): string {
    const packages = groupTypesByNamespace(types);
    const packageKeys = Object.keys(packages).sort();
    const statements = packageKeys.flatMap((packageName) => {
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
