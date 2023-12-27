# Create complex code snippets with just Tagged Templates

Coldstitch is a small but powerful library that enables JavaScript/TypeScript developers to write from simple to complex code snippets with ease. It uses [Tagged Templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) and some tricks to make sure the generate code is correct and well indented.

![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/roxlabs/coldstitch/build.yml?style=flat-square)
![Coldstitch on NPM](https://img.shields.io/npm/v/coldstitch?style=flat-square&label=coldstitch)
![License](https://img.shields.io/github/license/roxlabs/coldstitch?style=flat-square)

## About the project

This project was motivated by past experiences dealing with complex code generation on different languages. Some highlights:

- adds imports of referenced types
- serializes JS objects and arrays into the language's notation, with correct indentation
- automatically handles indentation, so templates can be written following the file's indentation
- support different langugae constructs via their own modules: `coldstitch/js`, `coldstitch/python`, etc

## Getting Started

Coldsnip can be used as a library, as a CLI or through direct integrations with other platforms. Check the [getting started guide](https://roxlabs.github.io/coldsnip/getting-started/) in order to determine the best option for your needs.

### Library

```ts
// the simple use-case, it allows you to write it like this:
const snippet = code`
  const obj = { hello: "world" };
  console.log(obj);
`;

// instead of like this:
const snippet = `const obj = { hello: "world" };
console.log(obj);`;

// or this
const snippet = `
const obj = { hello: "world" };
console.log(obj);
`.trim();
```

TODO: add more examples and documentation

## Roadmap

See the [open feature requests](https://github.com/roxlabs/coldsnip/labels/enhancement) for a list of proposed features and join the discussion.

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Make sure you read our [Code of Conduct](https://github.com/roxlabs/coldsnip/blob/main/CODE_OF_CONDUCT.md)
1. Fork the project and clone your fork
1. Setup the local environment with `npm install`
1. Create a feature branch (`git checkout -b feature/cool-thing`) or a bugfix branch (`git checkout -b fix/bad-bug`)
1. Commit the changes (`git commit -m 'feat: some meaningful message'`)
1. Push to the branch (`git push origin feature/cool-thing`)
1. Open a Pull Request

## License

Distributed under the MIT License. See [LICENSE](https://github.com/roxlabs/coldsnip/blob/main/LICENSE) for more information.
