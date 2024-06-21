'use strict';

/**
 *  diagnosis controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::diagnosis.diagnosis',({ strapi }) => ({
    // Method 1: Creating an entirely custom action
    // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    const patientId = ctx.query['mappedId'];

  // Custom filter logic for patient ID
  if (patientId) {
    ctx.query.filters = {
      ...ctx.query.filters,
      patient: {
        id: {
          $eq: patientId
        }
      }
    };
  }
    
    

   
    //if not a Manager, show only records relevant tothat hospital
    console.log("Fetching patients as ", ctx.state.auth.credentials.email, " with a role of [", ctx.state.auth.credentials.role.name, "]")
    if (ctx.state.auth.credentials.role.name != "Manager") {
        if (!ctx.query.filters.patient) {
    // If there's no patient key, initialize it
        ctx.query.filters.patient = {};
      }

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
          const hospitalCondition = affiliation.length > 0
          ? { hospital: { Name: { $eq: affiliation[0].Name } } }
            : { hospital: { Name: { $eq: "Unaffiliated" } } };
          if (ctx.query.filters.patient.hospital) {
            ctx.query.filters.patient.hospital = hospitalCondition.hospital;
          }
          else {
            ctx.query.filters.patient = {
              ...ctx.query.filters.patient,
              ...hospitalCondition,
            };
          }
  
          
          
        } catch (e) {
          console.log("error:", e);
        }
    } // Calling the default core action
    console.log(JSON.stringify(ctx.query.filters));
  
      const { data, meta } = await super.find(ctx);
  
      // some more custom logic
      meta.date = Date.now();
  
      return { data, meta };
  },
  // Custom create method
  async create(ctx) {
    let data = ctx.request.body.data;
    console.log(data);

    // Resolve patient name to ID if necessary
    if (typeof data.patient === 'string') {
      const patient = await strapi.entityService.findMany('api::patient.patient', {
        filters: { Name: data.patient, Contact: {Mobile:data.phone}},
        limit: 1,
      });

      if (patient.length > 0) {
        console.log(patient);
        ctx.request.body.data.patient = patient[0].id;
      } else {
        throw new Error('Patient not found');
      }
    }
    if (typeof data.Camp === 'string') {
      const camp = await strapi.entityService.findMany('api::camp.camp', {
        filters: { Name: data.Camp },
        limit: 1,
      });

      if (camp.length > 0) {
        ctx.request.body.data.camp = camp[0].id;
      } else {
        throw new Error('Camp not found');
      }
    }

    // Call the default create method
    return await super.create(ctx);
  },

  // Custom update method
  async update(ctx) {
    let data = ctx.request.body.data;

    // Resolve patient name to ID if necessary
    if (typeof data.patient === 'string') {
      const patient = await strapi.entityService.findMany('api::patient.patient', {
        filters: { Name: data.patient, Contact: { Mobile: data.phone } },
        limit: 1,
      });

      if (patient.length > 0) {
        ctx.request.body.data.patient = patient[0].id;
      } else {
        throw new Error('Patient not found');
      }
    }

    // Resolve Camp to ID if necessary
    if (typeof data.Camp === 'string') {
      const camp = await strapi.entityService.findMany('api::camp.camp', {
        filters: { Name: data.Camp },
        limit: 1,
      });

      if (camp.length > 0) {
        ctx.request.body.data.camp = camp[0].id;
      } else {
        throw new Error('Camp not found');
      }
    }

    // Call the default update method
    return await super.update(ctx);
  },

  }));
  

