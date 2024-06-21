'use strict';

/**
 * pledge service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pledge.pledge');
