import { CodeImpl, type Code } from "../code";
import { formatOptionsForLanguage } from "../format";
import { CustomFormatter, ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringify } from "../utils";

type TypeRefTraits = {
  packageName?: string;
  alias?: string;
};

interface KotlinTypeRef extends TypeRef {
  qualifiedName: string;
  alias?: string;
}

export function typeRef(typeName: string, { packageName, alias }: TypeRefTraits = {}): KotlinTypeRef {
  const parts = typeName.split(".");
  const name = parts[parts.length - 1];
  const namespace = packageName ?? parts.slice(0, -1).join(".");
  return {
    namespace,
    name,
    qualifiedName: packageName ? `${packageName}.${name}` : typeName,
    alias,
    language: "kotlin",
    toString: () => alias || name,
  };
}

type FormatOptions = {
  formatter?: CustomFormatter;
};

export function mapOf<T extends object>(value: T, options: FormatOptions = {}): Code {
  const { formatter } = options;
  const obj = stringify(
    value,
    {
      objectTokens: ["mapOf<String, Any>(", ")"],
      arrayTokens: ["arrayOf(", ")"],
      assignToken: " to ",
      formatKey: (key) => `"${key}"`,
      formatValue: (value) => {
        if (formatter) {
          const formatted = formatter(value);
          if (formatted !== undefined) {
            return formatted;
          }
        }
        if (value === null || value === undefined) {
          return "null";
        }
        if (typeof value === "string") {
          return `"${escapeStringQuotes(value)}"`;
        }
        if (typeof value === "number") {
          return value.toString();
        }
        if (typeof value === "bigint") {
          return `${typeRef("java.math.BigInteger")}("${value}")`;
        }
        if (typeof value === "boolean") {
          return value ? "true" : "false";
        }
        throw new Error(`Unsupported value type: ${typeof value}`);
      },
    },
    formatOptionsForLanguage("kotlin"),
  );
  return CodeImpl.fromString(obj);
}

export function arrayOf<T>(value: T[], options: FormatOptions = {}): Code {
  // despite of the name, mapOf can handle array as top-level value
  // so we can just call mapOf with the array value
  return mapOf(value, options);
}

class KotlinImportResolver extends ImportResolver<KotlinTypeRef> {
  resolve(types: KotlinTypeRef[]): string {
    const groups = groupTypesByNamespace(types);
    return Object.entries(groups)
      .map(([namespace, types]) => {
        const imports = types.map((type) => {
          const { alias, name } = type;
          return alias ? `import ${namespace}.${name} as ${alias}` : `import ${namespace}.${name}`;
        });
        return imports.join("\n");
      })
      .join("\n");
  }
}

export function imports(): ImportResolver {
  return new KotlinImportResolver();
}
