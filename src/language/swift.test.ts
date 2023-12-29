import { expect, test } from "vitest";
import { code } from "../code";
import * as swift from "./swift";

test("basic swift code template", () => {
  const value = "  hello world  ";
  const snippet = code`
    let trimmed = "${value}".trimmingCharacters(in: .whitespacesAndNewlines)
    print(trimmed)
  `;
  expect(snippet.toString()).toBe(
    'let trimmed = "  hello world  ".trimmingCharacters(in: .whitespacesAndNewlines)\nprint(trimmed)',
  );
});

test("swift code template with type ref", () => {
  const date = swift.typeRef("Date", { module: "Foundation" });
  const snippet = code`
    ${swift.imports()}

    let now = ${date}.now()
    print(now)
  `;

  expect(snippet.toString()).toBe(
    `
import Foundation

let now = Date.now()
print(now)`.trim(),
  );
});

test("swift code template with object literal", () => {
  const snippet = code`
    let obj: [String: Any] = ${swift.dict({ foo: "bar" })}
    print(obj)
  `;

  expect(snippet.toString()).toBe(
    `
let obj: [String: Any] = [
    "foo": "bar"
]
print(obj)`.trim(),
  );
});

test("swift code template with object literal further indented", () => {
  const snippet = code`
    let obj = transform([
        "input": ${swift.dict({ foo: "bar" })}
    ])
    print(obj)
  `;

  expect(snippet.toString()).toBe(
    `
let obj = transform([
    "input": [
        "foo": "bar"
    ]
])
print(obj)`.trim(),
  );
});
