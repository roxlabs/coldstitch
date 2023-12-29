import { expect, test } from "vitest";
import { code } from "../code";
import * as python from "./python";

test("basic python code template", () => {
  const value = "  hello world  ";
  const snippet = code`
    trimmed = "${value}".strip()
    print(trimmed)
  `;
  expect(snippet.toString()).toBe('trimmed = "  hello world  ".strip()\nprint(trimmed)');
});

test("python code template with type ref", () => {
  const json = python.typeRef("json");
  const snippet = code`
    ${python.imports()}

    package = ${json}.loads('{"name": "vitest"}')
    print(package)
  `;

  expect(snippet.toString()).toBe(
    `
import json

package = json.loads('{"name": "vitest"}')
print(package)`.trim(),
  );
});

test("python code template with object literal", () => {
  const snippet = code`
    obj = ${python.dict({ foo: "bar" })}
    print(obj)
  `;

  expect(snippet.toString()).toBe(
    `
obj = [
    "foo": "bar"
]
print(obj)`.trim(),
  );
});

test("python code template with object literal further indented", () => {
  const snippet = code`
    obj = transform([
        "input": ${python.dict({ foo: "bar" })}
    ])
    print(obj)
  `;

  expect(snippet.toString()).toBe(
    `
obj = transform([
    "input": [
        "foo": "bar"
    ]
])
print(obj)`.trim(),
  );
});
