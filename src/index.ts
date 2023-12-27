import { code } from "./code";
import { obj, typeRef } from "./js";

const app = "fal-ai/sdxl";

const input = {
  prompt: "a cute cat",
  model_name: "sdxl",
};

function main() {
  const fal = typeRef("*", {
    packageName: "@fal-ai/serverless-client",
    alias: "fal",
  });

  const snippet = code`
    const {} = ${fal}.subscribe("${app}", {
      input: ${obj(input)},
    })
  `;
}
