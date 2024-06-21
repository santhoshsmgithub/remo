"use strict";

const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const set = require("lodash.set");
const { roles, types, users } = require("../data/customData.json");

async function isFirstCustomRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });
  const customInitHasRun = await pluginStore.get({ key: "customInitHasRun" });
  await pluginStore.set({ key: "customInitHasRun", value: true });
  return !customInitHasRun;
}

async function clearFirstCustomRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });
  await pluginStore.set({ key: "customInitHasRun", value: false });
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const createdRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        type: "public",
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: createdRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = `./data/uploads/${fileName}`;

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  };
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  try {
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        // Get file name without the extension
        const [fileName] = file.name.split(".");
        // Upload each individual file
        const uploadedFile = await strapi
          .plugin("upload")
          .service("upload")
          .upload({
            files: file,
            data: {
              fileInfo: {
                alternativeText: fileName,
                caption: fileName,
                name: fileName,
              },
            },
          });

        // Attach each file to its entry
        set(entry, key, uploadedFile[0].id);
      }
    }

    // Actually create the entry in Strapi
    const createdEntry = await strapi.entityService.create(
      `api::${model}.${model}`,
      {
        data: entry,
      }
    );
  } catch (e) {
    console.log("model", entry, e);
  }
}

async function importCategories() {
  return Promise.all(
    categories.map((category) => {
      return createEntry({ model: "category", entry: category });
    })
  );
}

async function importHomepage() {
  const files = {
    "seo.shareImage": getFileData("default-image.png"),
  };
  await createEntry({ model: "homepage", entry: homepage, files });
}

async function importWriters() {
  return Promise.all(
    writers.map(async (writer) => {
      const files = {
        picture: getFileData(`${writer.email}.jpg`),
      };
      return createEntry({
        model: "writer",
        entry: writer,
        files,
      });
    })
  );
}

async function importArticles() {
  return Promise.all(
    articles.map((article) => {
      const files = {
        image: getFileData(`${article.slug}.jpg`),
      };

      return createEntry({
        model: "article",
        entry: {
          ...article,
          // Make sure it's not a draft
          publishedAt: Date.now(),
        },
        files,
      });
    })
  );
}

async function importGlobal() {
  const files = {
    favicon: getFileData("favicon.png"),
    "defaultSeo.shareImage": getFileData("default-image.png"),
  };
  return createEntry({ model: "global", entry: global, files });
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    global: ["find"],
    homepage: ["find"],
    article: ["find", "findOne"],
    category: ["find", "findOne"],
    writer: ["find", "findOne"],
  });

  // Create all entries
  await importCategories();
  await importHomepage();
  await importWriters();
  await importArticles();
  await importGlobal();
}

async function findAllRolesPermissions() {
  const roles = await strapi.entityService.findMany(
    "plugin::users-permissions.role",
    {
      populate: ["permissions"],
      filters: {
        type: {
          $eq: "flunkey",
        },
      },
    }
  );
  console.log("roles", JSON.stringify(roles, "", 2));
}

async function createRoleWithPermission(role, permissions) {
  console.log("Checking and updating role permissions");
  let createdRole = await strapi.entityService.findMany(
    "plugin::users-permissions.role",
    {
      populate: ["permissions"],
      filters: {
        type: {
          $eq: role,
        },
      },
    }
  );
  console.log("found role", createdRole);



  if (!createdRole || createdRole.length === 0) {
    const roleToCreate = {
      name: role,
      type: role,
      description: role,
      permissions: {
        "api::volunteer": {
          "controllers": {
            "volunteer": {
              "find": {
                "enabled": true
              }
            }
          }
        }
      }
    };

    const roleToCreateReady = JSON.parse( `{
      "name": "VolunteerInactive",
      "description": "role VolunteerInactive 2",
      "permissions": {
          "api::camp": {
              "controllers": {
                  "camp": {
                      "find": {
                          "enabled": true
                      },
                      "findOne": {
                          "enabled": true
                      }
                  }
              }
          }
      }
  }`);

  console.log(roleToCreateReady);
    createdRole = await strapi.entityService.create(
      "plugin::users-permissions.role",
      {
        data: roleToCreateReady,
      }
    );
    console.log("createdRole", createdRole);
  }

  //     const permissionIds = await strapi.query("plugin::users-permissions.permissions").createMany({
  //     data: { permissions },
  //   });

  //   console.log("permissionIds ", permissionIds);
  //   await strapi.query("plugin::users-permissions.role").update({
  //     where: { id: createdRole[0].id },
  //     data: { permissions: permissionIds },
  //   });
}

// async function boostrapPermissions() {
//     const roles = await strapi
//       .service("plugin::users-permissions.role")
//       .getRoles();
//     const _public = await strapi
//       .service("plugin::users-permissions.role")
//       .getRole(roles.filter((role) => role.type === "public")[0].id);
//     for (const permission of Object.keys(_public.permissions)) {
//       if (permission.startsWith("api")) {
//         for (const controller of Object.keys(
//           _public.permissions[permission].controllers
//         )) {
//           _public.permissions[permission].controllers[
//             controller
//           ].find.enabled = true;
//         }
//       }
//     }
//     await strapi
//       .service("plugin::users-permissions.role")
//       .updateRole(_public.id, _public);
//   }

async function findAllContentTypes() {
  console.log(JSON.stringify(strapi.api["volunteer"], "", 2));
  console.log(JSON.stringify(strapi.models.roles));
}

module.exports = async () => {
  await clearFirstCustomRun();
  const shouldImportSeedData = await isFirstCustomRun();

  if (1 || shouldImportSeedData) {
    try {
      console.log("Setting up the custom template...");
      await findAllRolesPermissions();
      await createRoleWithPermission("flunkey", [
        { action: "api::volunteer.volunteer.find" },
        { action: "api::volunteer.volunteer.findOne" },
        { action: "api::volunteer.volunteer.update" },
        { action: "api::donation.donation.find" },
        { action: "api::donation.donation.findOne" },
      ]);
      //   await findAllContentTypes();
      //await importSeedData();
      console.log("Ready to go");
    } catch (error) {
      console.log("Could not import seed data");
      console.error(error);
    }
  }
};
