import { CodeImpl, type Code } from "./code";
import { ImportResolver, TypeRef } from "./types";
import { stringifyObject } from "./utils";

type TypeRefTraits = {
  packageName?: string;
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
  {
    packageName,
    alias,
    defaultImport = false,
    typeOnly = false,
  }: TypeRefTraits = {},
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
  const obj = stringifyObject(value, {
    objectTokens: ["{", "}"],
    arrayTokens: ["[", "]"],
    formatKey: (key) => key,
    formatValue: (value) => {
      if (value === null) {
        return "null";
      }
      if (value === undefined) {
        return "undefined";
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

class JavaScriptImportResolver extends ImportResolver<JsTypeRef> {
  resolve(types: JsTypeRef[]): string {
    const packages: Record<string, JsTypeRef[]> = {};
    types.forEach((type) => {
      if (!type.namespace) {
        return;
      }
      if (!packages[type.namespace]) {
        packages[type.namespace] = [];
      }
      packages[type.namespace].push(type);
    });

    // order packages by name
    const orderedPackages = Object.keys(packages).sort();
    const statements = orderedPackages.map((packageName) => {
      const types = packages[packageName];
      const orderedTypes = types.sort((a, b) => a.name.localeCompare(b.name));
      const aliases = orderedTypes
        .map((type) => {
          const typeOnly = type.typeOnly ? "type " : "";
          if ("alias" in type && type.alias) {
            return `${typeOnly}${type.name} as ${type.alias}`;
          }
          return typeOnly + type.name;
        })
        .join(", ");
      return `import { ${aliases} } from "${packageName}";`;
    });
    return statements.join("\n");
  }
}

export function imports(): ImportResolver {
  return new JavaScriptImportResolver();
}
