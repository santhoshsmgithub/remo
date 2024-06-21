'use strict';

/**
 *  hospital controller
 */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::hospital.hospital');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::hospital.hospital', ({ strapi }) => ({
  async find(ctx) {
    if (ctx.state.auth.credentials.role.name !== 'Manager') {
      try {
        const userEmail = ctx.state.auth.credentials.email;
        console.log('Fetching hospitals as', userEmail, 'with a role of [', ctx.state.auth.credentials.role.name, ']');
        const adminHospital = await strapi.entityService.findMany(
          'api::hospital.hospital',
          {
            filters: {
              AdminContactInfo: {
                Email: {
                  $eq: userEmail,
                },
              },
            }
          }
        );

        if (adminHospital) {
          
          ctx.query.filters = {
            Name: {
              $eq: adminHospital[0].Name,
            },
          };
        } else {
          // If the user is not an admin of any hospital, return an empty array
          ctx.query.filters = {
            id: {
              $eq: null,
            },
          };
        }
      } catch (error) {
        console.log('Error:', error);
      }
    }

    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },
}));
