import { CodeImpl, type Code } from "../code";
import { formatOptionsForLanguage } from "../format";
import { CustomFormatter, ImportResolver, TypeRef } from "../types";
import { escapeStringQuotes, groupTypesByNamespace, stringify } from "../utils";

type TypeRefTraits = {
  packageName?: string;
};

interface JavaTypeRef extends TypeRef {
  qualifiedName: string;
}

export function typeRef(typeName: string, { packageName }: TypeRefTraits = {}): JavaTypeRef {
  const parts = typeName.split(".");
  const name = parts[parts.length - 1];
  const namespace = packageName ?? parts.slice(0, -1).join(".");
  return {
    namespace,
    name,
    qualifiedName: packageName ? `${packageName}.${typeName}` : typeName,
    language: "java",
    toString: () => name,
  };
}

type ObjOptions = {
  formatter?: CustomFormatter;
};

export function mapOf<T extends object>(value: T, options: ObjOptions = {}): Code {
  const { formatter } = options;
  const obj = stringify(
    value,
    {
      objectTokens: ["Map.of(", ")"],
      arrayTokens: ["List.of(", ")"],
      assignToken: ", ",
      formatKey: (key) => `"${escapeStringQuotes(key)}"`,
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
        if (typeof value === "number") {
          return value.toString();
        }
        if (typeof value === "bigint") {
          return `new ${typeRef("java.math.BigInteger")}("${value}")`;
        }
        if (typeof value === "boolean") {
          return value ? "true" : "false";
        }
        throw new Error(`Unsupported value type: ${typeof value}`);
      },
    },
    formatOptionsForLanguage("java"),
  );
  return CodeImpl.fromString(obj);
}

export function listOf<T>(value: T[]): Code {
  return mapOf(value);
}

class JavaImportResolver extends ImportResolver<JavaTypeRef> {
  resolve(types: JavaTypeRef[]): string {
    const grouped = groupTypesByNamespace(types);
    return Object.entries(grouped)
      .map(([_, types]) =>
        types
          .map((type) => {
            const { qualifiedName } = type;
            return `import ${qualifiedName};`;
          })
          .join("\n"),
      )
      .join("\n");
  }
}

export function imports(): ImportResolver {
  return new JavaImportResolver();
}
