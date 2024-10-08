import { CodeImpl, type Code } from "../code";
import { formatOptionsForLanguage } from "../format";
import { CustomFormatter, ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringify } from "../utils";

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

type ObjOptions = {
  formatter?: CustomFormatter;
};

export function obj<T extends object>(value: T, options: ObjOptions = {}): Code {
  const { formatter } = options;
  const obj = stringify(
    value,
    {
      objectTokens: ["{", "}"],
      arrayTokens: ["[", "]"],
      assignToken: ": ",
      formatKey: (key) => key,
      formatValue: (value) => {
        if (formatter) {
          const formatted = formatter(value);
          if (formatted !== undefined) {
            return formatted;
          }
        }
        if (value === null) {
          return "null";
        }
        if (value === undefined) {
          return "undefined";
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
