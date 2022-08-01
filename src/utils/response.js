'use strict';

/**
 * @class Response.
 */

 class Response {
     /**
      * @property {Boolean} success true/false.
      * @property {Number} code Status code.
      * @property {String} message Response message.
      * @property {Object} data Response data.
      */

      constructor(success, code, message, data) {
          this.success = success;
          this.code = code;
          this.message = message;
          this.data = data;
      };
 }

module.exports = Response;