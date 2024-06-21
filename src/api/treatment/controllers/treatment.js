'use strict';

/**
 *  treatment controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::treatment.treatment',({ strapi }) => ({
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
    if (ctx.state.auth.credentials.role.name != "Manager") {
        console.log("Fetching patients as ", ctx.state.auth.credentials.email, " with a role of [", ctx.state.auth.credentials.role.name, "]")
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
            // append the hospital filter to the existing filters
            


            ctx.query.filters = {
              ...ctx.query.filters,
              hospital: { Name: { $eq: affiliation[0].Name } },
            };
          else
            ctx.query.filters = {
              ...ctx.query.filters,
              hospital: { Name: { $eq: "Unaffiliated" } },
            };
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
  async create(ctx) {
    let data = ctx.request.body.data;
    console.log(data);

    
        // Resolve patient name to ID if necessary
    if (typeof data.Name === 'string') {
      // check if data has phone. if so, add to the filter
      
            const patients = await strapi.entityService.findMany('api::patient.patient', {
                filters: { Name: data.Name , Contact: {Mobile:data.phone}},
                limit: 1,
            });

            if (patients.length > 0) {
                ctx.request.body.data.patient = patients[0].id;
            } else {
                throw new Error('Patient not found');
            }
        }
        if (typeof data.hospital === 'string') {
            const hospitals = await strapi.entityService.findMany('api::hospital.hospital', {
                filters: { Name: data.hospital },
                limit: 1,
            });

            if (hospitals.length > 0) {
                ctx.request.body.data.hospital = hospitals[0].id;
            } else {
                throw new Error('Hospital not found');
            }
        }
        console.log(ctx.request.body.data);

        // Call the default create method with the updated ctx
        return await super.create(ctx);
  },
  async update(ctx) {
    let data = ctx.request.body.data;
    
    // if (data.Photo && typeof data.Photo === 'object' && data.Photo.data && data.Photo.data.id) {
    //     ctx.request.body.data.Photo = data.Photo.data.id;
    // }

        // Resolve patient name to ID if necessary
        if (typeof data.Name === 'string') {
            const patients = await strapi.entityService.findMany('api::patient.patient', {
                filters: { Name: data.Name, Contact: {Mobile:data.phone} },
                limit: 1,
            });

            if (patients.length > 0) {
                ctx.request.body.data.patient = patients[0].id;
            } else {
                throw new Error('Patient not found');
            }
        }

        // Resolve hospital name to ID if necessary
        if (typeof data.hospital === 'string') {
            const hospitals = await strapi.entityService.findMany('api::hospital.hospital', {
                filters: { Name: data.hospital },
                limit: 1,
            });

            if (hospitals.length > 0) {
                ctx.request.body.data.hospital = hospitals[0].id;
            } else {
                throw new Error('Hospital not found');
            }
        }

        // Call the default update method with the updated ctx
        return await super.update(ctx);
    },

  }));
  
