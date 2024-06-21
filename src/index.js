"use strict";

const boostrap = require('./bootstrap');
// const customBootstrap = require('./customBootstrap');
module.exports = {
  async bootstrap() {
    await boostrap();
    // await customBootstrap();
  },

  async register() {
    // console.log("Clearing customFirstRun flag - REMOVE THIS LINE AFTER DEVELOPMENT");
  },

  async destroy() {
    // console.log("DESTROYING CUSTOM TEMPLATE");
  },
}


