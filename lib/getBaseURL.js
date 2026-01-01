import { DJANGO_BACKEND_URL } from './constants';

/**
 * Get Django Backend Base URL
 * Uses centralized configuration from constants.js
 */
export const getBaseURL = () => {
  return DJANGO_BACKEND_URL;
};

export default getBaseURL;
