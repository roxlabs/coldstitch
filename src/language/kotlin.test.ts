import { expect, test } from "vitest";
import { code } from "../code";
import * as kotlin from "./kotlin";

test("kotlin code template with type ref", () => {
  const String = kotlin.typeRef("kotlin.String");
  const snippet = code`
    ${kotlin.imports()}

    val hello = ${String}("hello world")
    println(hello)
  `;

  expect(snippet.toString()).toBe(
    `
import kotlin.String

val hello = String("hello world")
println(hello)`.trim(),
  );
});

test("kotlin code template with mapOf", () => {
  const snippet = code`
    val map = ${kotlin.mapOf({ foo: "bar" })}
    println(map)
  `;

  expect(snippet.toString()).toBe(
    `
val map = mapOf<String, Any>(
    "foo" to "bar"
)
println(map)`.trim(),
  );
});

test("kotlin code template with arrayOf", () => {
  const snippet = code`
    val array = ${kotlin.arrayOf(["foo", "bar"])}
    println(array)
  `;
  expect(snippet.toString()).toBe(
    `
val array = arrayOf("foo", "bar")
println(array)`.trim(),
  );
});

test("kotlin code template with mapOf and a nested arrayOf", () => {
  const snippet = code`
    val map = ${kotlin.mapOf({ foo: ["bar", "baz"] })}
    println(map)
  `;

  expect(snippet.toString()).toBe(
    `
val map = mapOf<String, Any>(
    "foo" to arrayOf("bar", "baz")
)
println(map)`.trim(),
  );
});
