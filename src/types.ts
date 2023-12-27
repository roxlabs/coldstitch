export interface TypeRef {
  namespace: string;
  name: string;
  language: string;
  toString(): string;
}

export class ImportResolver<T extends TypeRef = TypeRef> {
  resolve(types: T[]): string {
    throw new Error("Not implemented");
  }
}

export function isTypeRef(value: any): value is TypeRef {
  return value && typeof value === "object" && "namespace" in value && "name" in value;
}
