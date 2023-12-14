const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");

const SECRET = process.env.SECRET ?? "";

if (!SECRET.length) {
  throw new Error("SECRET is required to run this script");
}

const API_URL = "https://api-v2.lens.dev";
const mutation = `
               mutation InternalUpdateModuleOptions($request: InternalUpdateModuleOptionsRequest!) {
                  internalUpdateModuleOptions(request: $request)
                }
              `;

const files = [
  { filename: "follow-modules.json", type: "FOLLOW" },
  { filename: "open-actions.json", type: "OPEN_ACTION" },
  { filename: "reference-modules.json", type: "REFERENCE" },
];

const lastSyncedFileReadData = fs.readFileSync(
  "scripts/last-synced.json",
  "utf8"
);
const lastSyncedFileData = JSON.parse(lastSyncedFileReadData);

let currentSyncData = {};
const verifyPromises = [];

function hashObject(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash("md5").update(str).digest("hex");
}

function updateLastSynced(file, moduleId, currentHash) {
  if (currentSyncData[file.type]) {
    if (currentSyncData[file.type][moduleId]) return;
    currentSyncData[file.type][moduleId] = currentHash;
  } else {
    currentSyncData[file.type] = { [moduleId]: currentHash };
  }
  return;
}

for (const file of files) {
  const data = fs.readFileSync(file.filename, "utf8");
  const modules = JSON.parse(data);

  for (const module of modules) {
    const moduleId = `${file.type}-${module.name}-${module.address}`;
    const currentHash = hashObject(module);

    if (lastSyncedFileData[file.type]?.[moduleId]) {
      updateLastSynced(file, moduleId, currentHash);
      if (lastSyncedFileData[file.type][moduleId] === currentHash) continue;
    }

    const variables = {
      request: {
        i: module.address,
        secret: SECRET,
        t: file.type,
        v: true,
        lma: !module.requiresUserFunds,
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
        updateLastSynced(file, moduleId, currentHash);
      })
      .catch((error) => {
        console.error(`Error verify module: ${module.name}`, error);
      });

    verifyPromises.push(promise);
  }
}

Promise.all(verifyPromises).then(() => {
  if (verifyPromises.length === 0) {
    return console.log("✅ Everything is up to date.")
  }
  console.log("✅ All modules verified.");

  console.log("⌛ Checking removed modules...");
  const removedModules = {};

  for (const key in lastSyncedFileData) {
    if (currentSyncData.hasOwnProperty(key)) {
      removedModules[key] = {};
      for (const moduleId in lastSyncedFileData[key]) {
        if (!currentSyncData[key].hasOwnProperty(moduleId)) {
          // If the moduleId doesn't exist in currentSyncData, it's considered missing
          removedModules[key][moduleId] = lastSyncedFileData[key][moduleId];
        }
      }
    } else {
      removedModules[key] = lastSyncedFileData[key];
    }
  }

  console.log("➡︎ Removed Modules -", removedModules);
  for (const type in removedModules) {
    for (const moduleId in removedModules[type]) {
      console.log("Unverifing module:", moduleId);

      const moduleType = moduleId.split("-")[0];
      const moduleAddress = moduleId.split("-")[2];

      axios
        .post(API_URL, {
          query: mutation,
          variables: {
            request: {
              i: moduleAddress,
              secret: SECRET,
              t: moduleType,
              v: false,
              lma: false,
            },
          },
        })
        .then((response) => {
          console.log(
            `🚮 Module unverified: ${moduleId}, Response:`,
            response.data
          );
        })
        .catch((error) => {
          console.error(`Error unverify module: ${moduleId}`, error);
        });
    }
  }

  fs.writeFileSync(
    "scripts/last-synced.json",
    JSON.stringify(currentSyncData, null, 2)
  );
});
