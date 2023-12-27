import { expect, test } from "vitest";
import { code } from "./code";
import * as js from "./js";

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
  const read = js.typeRef("readFile", { packageName: "fs/promises" });
  const snippet = code`
    ${js.imports()}

    const package = await ${read}("./package.json");
    console.log(package);
  `;

  console.log(snippet.toString());

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

test("code tempalte with object literal further indented", () => {
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
