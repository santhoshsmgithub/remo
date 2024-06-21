'use strict';

/**
 * pledge router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::pledge.pledge');
