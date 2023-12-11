const fs = require("fs");
const axios = require("axios");

const files = [
  { filename: "follow-modules.json", type: "FOLLOW" },
  { filename: "open-actions.json", type: "OPEN_ACTION" },
  { filename: "reference-modules.json", type: "REFERENCE" },
];

for (const file of files) {
  const data = fs.readFileSync(file.filename, "utf8");
  const modules = JSON.parse(data);

  for (const module of modules) {
    const mutation = `
                mutation InternalSetModuleVerified($request: InternalSetModuleVerifiedRequest!) {
                  internalSetModuleVerified(request: $request)
                }
              `;

    const variables = {
      request: {
        i: module.address,
        secret: process.env.SECRET ?? "",
        t: file.type,
        v: true,
      },
    };

    axios
      .post("https://api-mumbai.lens-v2.crtlkey.com", {
        query: mutation,
        variables,
      })
      .then((response) => {
        console.log(`Module: ${module.name}, Response:`, response.data);
      })
      .catch((error) => {
        console.error(`Error for module: ${module.name}`, error);
      });
  }
}
