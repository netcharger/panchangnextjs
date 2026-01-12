/**
 * Web-specific constants
 * This file should NOT import anything from panchangam-mobile
 */

// ============================================================================
// SERVER CONFIGURATION - CHANGE THESE VALUES IN ONE PLACE
// ============================================================================

/**
 * Django Backend URL
 * ⬅️ CHANGE THIS TO YOUR DJANGO BACKEND URL
 * Set DJANGO_BACKEND_URL environment variable or it will default to localhost
 */
const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || process.env.NEXT_PUBLIC_DJANGO_BACKEND_URL || "https://api.dailypanchangam.com";

/**
 * Web App URL (Next.js frontend)
 * ⬅️ CHANGE THIS TO YOUR WEB APP URL
 * In production, set NEXT_PUBLIC_WEB_APP_URL environment variable
 */
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";

module.exports = {
  DJANGO_BACKEND_URL,
  WEB_APP_URL,
};
