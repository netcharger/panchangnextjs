const { DJANGO_BACKEND_URL } = require('./constants.js');

/**
 * Get Django Backend Base URL
 * Falls back to localhost for development
 */
const getBaseURL = () => {
    return DJANGO_BACKEND_URL;
};

module.exports = getBaseURL;
