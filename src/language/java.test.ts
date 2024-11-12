import { expect, test } from "vitest";
import { code } from "../code";
import * as java from "./java";

test("java code template with type ref", () => {
  const String = java.typeRef("java.lang.String");
  const snippet = code`
    ${java.imports()}

    var hello = new ${String}("hello world");
    System.out.println(hello);
  `;

  expect(snippet.toString()).toBe(
    `
import java.lang.String;

var hello = new String("hello world");
System.out.println(hello);`.trim(),
  );
});

test("java code template with mapOf", () => {
  const snippet = code`
    var map = ${java.mapOf({ foo: "bar" })};
    System.out.println(map);
  `;

  expect(snippet.toString()).toBe(
    `
var map = Map.of(
    "foo", "bar"
);
System.out.println(map);`.trim(),
  );
});

test("java code template with listOf", () => {
  const snippet = code`
    var array = ${java.listOf(["foo", "bar"])};
    System.out.println(array);
  `;
  expect(snippet.toString()).toBe(
    `
var array = List.of("foo", "bar");
System.out.println(array);`.trim(),
  );
});

test("java code template with mapOf and a nested listOf", () => {
  const snippet = code`
    var map = ${java.mapOf({ foo: ["bar", "baz"] })};
    System.out.println(map);
  `;

  expect(snippet.toString()).toBe(
    `
var map = Map.of(
    "foo", List.of("bar", "baz")
);
System.out.println(map);`.trim(),
  );
});
