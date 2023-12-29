import { expect, test } from "vitest";
import { TypeRef } from "./types";
import {
  createTemplateStringsArray,
  getLineIndentation,
  groupTypesByNamespace,
  lastItem,
  resolveIndentation,
  resolveLineIndentation,
  stringifyObject,
} from "./utils";

test("stringifyObject", () => {
  const object = { a: 1, b: [2, 3], c: { d: 4 } };
  const result = stringifyObject(object, {
    objectTokens: ["{", "}"],
    arrayTokens: ["[", "]"],
    assignToken: ": ",
    formatKey: (key: string) => `"${key}"`,
    formatValue: (value: any) => JSON.stringify(value),
  });
  expect(result).toBe('{\n  "a": 1,\n  "b": [2, 3],\n  "c": {\n    "d": 4\n  }\n}');
});

test("createTemplateStringsArray", () => {
  const literals = ["Hello, ", " world!"];
  const result = createTemplateStringsArray(literals);
  expect(result).toEqual(expect.arrayContaining(literals));
  expect(result.raw).toEqual(expect.arrayContaining(literals));
});

test("resolveLineIndentation", () => {
  const line = "    indented line";
  const result = resolveLineIndentation(line);
  expect(result).toEqual({ indentChar: " ", indentSize: 4 });
});

test("getLineIndentation", () => {
  const line = "    indented line";
  const result = getLineIndentation(line);
  expect(result).toBe("    ");
});

test("resolveIndentation", () => {
  const code = "\n    indented line\n";
  const result = resolveIndentation(code);
  expect(result).toEqual({ indentChar: " ", indentSize: 4 });
});

test("resolveIndentation [tabs]", () => {
  const code = "\n\tindented line\n";
  const result = resolveIndentation(code);
  expect(result).toEqual({ indentChar: "\t", indentSize: 1 });
});

test("lastItem", () => {
  const array = [1, 2, 3];
  const result = lastItem(array);
  expect(result).toBe(3);
});

test("groupTypesByNamespace", () => {
  const types: TypeRef[] = [
    { namespace: "ns1", name: "type1", language: "js" },
    { namespace: "ns1", name: "type2", language: "js" },
    { namespace: "ns2", name: "type3", language: "js" },
  ];
  const result = groupTypesByNamespace(types);
  expect(result).toEqual({
    ns1: [
      { namespace: "ns1", name: "type1", language: "js" },
      { namespace: "ns1", name: "type2", language: "js" },
    ],
    ns2: [{ namespace: "ns2", name: "type3", language: "js" }],
  });
});
