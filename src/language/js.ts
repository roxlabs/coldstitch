import { CodeImpl, type Code } from "../code";
import { formatOptionsForLanguage } from "../format";
import { ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringifyObject } from "../utils";

type TypeRefTraits = {
  from?: string;
  alias?: string;
  defaultImport?: boolean;
  typeOnly?: boolean;
};

interface JsTypeRef extends TypeRef {
  alias?: string;
  packageName?: string;
  defaultImport: boolean;
  typeOnly: boolean;
  language: "js";
}

export function typeRef(
  typeName: string,
  { from: packageName, alias, defaultImport = false, typeOnly = false }: TypeRefTraits = {},
): JsTypeRef {
  return {
    namespace: packageName ?? "",
    name: typeName,
    alias,
    packageName,
    defaultImport,
    typeOnly,
    language: "js",
    toString: () => alias || typeName,
  };
}

export function obj<T extends object>(value: T): Code {
  const obj = stringifyObject(
    value,
    {
      objectTokens: ["{", "}"],
      arrayTokens: ["[", "]"],
      assignToken: ": ",
      formatKey: (key) => key,
      formatValue: (value) => {
        if (value === null) {
          return "null";
        }
        if (value === undefined) {
          return "undefined";
        }
        if (typeof value === "string") {
          return `"${escapeStringQuotes(value)}"`;
        }
        if (typeof value === "number") {
          return value.toString();
        }
        if (typeof value === "boolean") {
          return value ? "true" : "false";
        }
        throw new Error(`Unsupported value type: ${typeof value}`);
      },
    },
    formatOptionsForLanguage("js"),
  );
  return CodeImpl.fromString(obj);
}

export function array<T extends object>(value: T[]): Code {
  return obj(value);
}

class JavaScriptImportResolver extends ImportResolver<JsTypeRef> {
  resolve(types: JsTypeRef[]): string {
    const packages = groupTypesByNamespace(types);
    const packageKeys = Object.keys(packages).sort();
    const statements = packageKeys.map((packageName) => {
      const types = packages[packageName].sort((a, b) => a.name.localeCompare(b.name));
      const namedImports = types
        .filter((type) => !type.defaultImport)
        .map((type) => {
          const typeOnly = type.typeOnly ? "type " : "";
          if (type.alias) {
            return `${typeOnly}${type.name} as ${type.alias}`;
          }
          return typeOnly + type.name;
        })
        .join(", ");
      const imports = [];
      types
        .filter((type) => type.defaultImport)
        .forEach((type) => {
          imports.push(type.alias ? `${type.name} as ${type.alias}` : type.name);
        });
      if (namedImports) {
        if (imports.length > 0) {
          imports.push(",");
        }
        imports.push("{", namedImports, "}");
      }
      return `import ${imports.join(" ")} from "${packageName}";`;
    });
    return statements.join("\n");
  }
}

export function imports(): ImportResolver {
  return new JavaScriptImportResolver();
}
