"use strict";

/**
 *  patient controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::patient.patient", ({ strapi }) => ({
  // Method 1: Creating an entirely custom action
  async exampleAction(ctx) {
    try {
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    //if not a Manager, show only records relevant tothat hospital
    console.log("Fetching patients as ", ctx.state.auth.credentials.email, " with a role of [", ctx.state.auth.credentials.role.name, "]")
    if (ctx.state.auth.credentials.role.name != "Manager") {
      try {
        const uemail = ctx.state.auth.credentials.email;
        const affiliation = await strapi.entityService.findMany(
          "api::hospital.hospital",
          {
            filters: {
              AdminContactInfo: {
                Email: {
                  $eq: uemail,
                },
              },
            },
          }
        );

        if (affiliation.length > 0)
          ctx.query.filters = {
            hospital: { Name: { $eq: affiliation[0].Name } },
          };
        else
          ctx.query.filters = {
            hospital: { Name: { $eq: "Unaffiliated" } },
          };
      } catch (e) {
        console.log("error:", e);
      }
    } // Calling the default core action

    const { data, meta } = await super.find(ctx);

    // some more custom logic
    // meta.date = Date.now();

    return { data, meta };
  },
  async delete(ctx) {
    const patientId = ctx.params.id;

    try {
      // Fetch related diagnoses and treatments
      const [diagnoses, treatments] = await Promise.all([
        strapi.entityService.findMany("api::diagnosis.diagnosis", {
          filters: { patient: patientId },
        }),
        strapi.entityService.findMany("api::treatment.treatment", {
          filters: { patient: patientId },
        }),
      ]);

      // Delete related diagnoses
      for (const diagnosis of diagnoses) {
        await strapi.entityService.delete("api::diagnosis.diagnosis", diagnosis.id);
      }

      // Delete related treatments
      for (const treatment of treatments) {
        await strapi.entityService.delete("api::treatment.treatment", treatment.id);
      }

      // Now delete the patient
      const deletedPatient = await super.delete(ctx);
      return deletedPatient;
    } catch (error) {
      ctx.throw(500, `Error deleting patient with ID ${patientId}: ${error.message}`);
    }
  },
}));
