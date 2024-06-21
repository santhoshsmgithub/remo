'use strict';

/**
 *  pledge controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::pledge.pledge');
