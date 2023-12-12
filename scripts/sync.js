const fs = require("fs");
const axios = require("axios");

const SECRET = process.env.SECRET ?? "";
const API_URL = "https://api-mumbai.lens-v2.crtlkey.com";
const mutation = `
                mutation InternalSetModuleVerified($request: InternalSetModuleVerifiedRequest!) {
                  internalSetModuleVerified(request: $request)
                }
              `;

const files = [
  { filename: "follow-modules.json", type: "FOLLOW" },
  { filename: "open-actions.json", type: "OPEN_ACTION" },
  { filename: "reference-modules.json", type: "REFERENCE" },
];

const promises = [];
const lastSyncedFileReadData = fs.readFileSync(
  "scripts/last-synced.json",
  "utf8"
);
const lastSyncedFileData = JSON.parse(lastSyncedFileReadData);

let lastSynced = {};

for (const file of files) {
  const data = fs.readFileSync(file.filename, "utf8");
  const modules = JSON.parse(data);

  for (const module of modules) {
    const moduleId = `${file.type}-${module.name}-${module.address}`;

    const variables = {
      request: {
        i: module.address,
        secret: SECRET,
        t: file.type,
        v: true,
      },
    };

    const promise = axios
      .post(API_URL, {
        query: mutation,
        variables,
      })
      .then((response) => {
        console.log(
          `Module Verified: ${module.name}, Response:`,
          response.data
        );
        if (lastSynced[file.type]) {
          if (lastSynced[file.type].includes(moduleId)) return;
          lastSynced[file.type].push(moduleId);
        } else {
          lastSynced[file.type] = [moduleId];
        }
      })
      .catch((error) => {
        console.error(`Error verify module: ${module.name}`, error);
      });

    promises.push(promise);
  }
}

Promise.all(promises).then(() => {
  console.log("All modules verified.");

  console.log("Checking removed modules...");
  const removedModules = {};
  for (const key in lastSyncedFileData) {
    removedModules[key] = lastSyncedFileData[key].filter(
      (item) => !lastSynced[key].includes(item)
    );
  }

  console.log("🚀 ~ removedModules:", removedModules);
  for (const type in removedModules) {
    for (const moduleKey of removedModules[type]) {
      console.log("Unverifing module:", moduleKey);

      const moduleType = moduleKey.split("-")[0];
      const moduleAddress = moduleKey.split("-")[2];

      axios
        .post(API_URL, {
          query: mutation,
          variables: {
            request: {
              i: moduleAddress,
              secret: SECRET,
              t: moduleType,
              v: false,
            },
          },
        })
        .then((response) => {
          console.log(
            `Module unverified: ${moduleKey}, Response:`,
            response.data
          );
        })
        .catch((error) => {
          console.error(`Error unverify module: ${moduleKey}`, error);
        });
    }
  }
  console.log("Unverified removed modules.");

  fs.writeFileSync(
    "scripts/last-synced.json",
    JSON.stringify(lastSynced, null, 2)
  );
});
