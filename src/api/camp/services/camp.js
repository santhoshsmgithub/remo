'use strict';

/**
 * camp service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::camp.camp');
