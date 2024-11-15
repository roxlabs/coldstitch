import { expect, test } from "vitest";
import { code, omitLine } from "./code";
import * as js from "./language/js";

test("basic code template", () => {
  const value = "  hello world  ";
  const snippet = code`
    const trimmed = "${value}".trim();
    console.log(trimmed);
  `;
  expect(snippet.toString()).toBe(
    `
const trimmed = "  hello world  ".trim();
console.log(trimmed);
  `.trim(),
  );
});

test("code template with type ref", () => {
  const read = js.typeRef("readFile", { from: "fs/promises" });
  const snippet = code`
    ${js.imports()}

    const package = await ${read}("./package.json");
    console.log(package);
  `;

  expect(snippet.toString()).toBe(
    `
import { readFile } from "fs/promises";

const package = await readFile("./package.json");
console.log(package);
  `.trim(),
  );
});

test("code template with object literal", () => {
  const snippet = code`
    const obj = ${js.obj({ foo: "bar" })};
    console.log(obj);
  `;

  expect(snippet.toString()).toBe(
    `
const obj = {
  foo: "bar"
};
console.log(obj);
  `.trim(),
  );
});

test("code template with object literal further indented", () => {
  const snippet = code`
    const obj = tranform({
      input: ${js.obj({ foo: "bar" })}
    });
    console.log(obj);
  `;

  expect(snippet.toString()).toBe(
    `
const obj = tranform({
  input: {
    foo: "bar"
  }
});
console.log(obj);
  `.trim(),
  );
});

test("test js code template with default import", () => {
  const fs = js.typeRef("*", { from: "fs/promises", alias: "fs", defaultImport: true });
  const snippet = code`
    ${js.imports()}

    const package = await ${fs}.readFile("./package.json");
    console.log(package);
  `;

  expect(snippet.toString()).toBe(
    `
import * as fs from "fs/promises";

const package = await fs.readFile("./package.json");
console.log(package);
  `.trim(),
  );
});

test("test code template with omitted line", () => {
  const snippet = code`
    const obj = {
      omittedProp: ${omitLine()},
      keepProp: "keep"
    };
  `;

  expect(snippet.toString()).toBe(
    `
const obj = {
  keepProp: "keep"
};
  `.trim(),
  );
});

test("test code template with object containing an anonymous function as a value", () => {
  const obj = {
    fn: () => "hello",
  };
  expect(js.obj(obj).toString()).toBe('{\n  fn: "fn function reference"\n}');
});

test("test code template with object containing a named function as a value", () => {
  function hello() {
    return "hello";
  }
  const obj = {
    fn: hello,
  };
  expect(js.obj(obj).toString()).toBe('{\n  fn: "hello function reference"\n}');
});

test("test code template with object containing a Date as a value and a custom formatter", () => {
  const obj = {
    date: new Date("2021-01-01"),
  };
  const formatter = (value: any) => {
    if (value instanceof Date) {
      return `"${value.toISOString()}"`;
    }
  };
  expect(js.obj(obj, { formatter }).toString()).toBe('{\n  date: "2021-01-01T00:00:00.000Z"\n}');
});

test("test code template with nested array of code templates", () => {
  const type = code`
    type Foo = {
      bar: string;
    };
  `;
  const types = [type, type];
  const snippet = code`
    ${types}
  `;

  expect(snippet.toString()).toBe(
    `
type Foo = {
  bar: string;
};
type Foo = {
  bar: string;
};`.trim(),
  );
});
