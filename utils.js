'use strict'

/**
  * @param {number} statusCode
  * @param {object} data
*/
module.exports.sendResponse = (statusCode, data) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(data),
  };
}

/**
  * @param {object} error
  * @param {string} message
*/
module.exports.sendErrorResponse = (error, message = '') => {
  return {
    statusCode: error.statusCode || 500,
    body: JSON.stringify({
      ...error,
      message: message || error.message,
    }),
  };
}

