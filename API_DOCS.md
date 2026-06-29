/**
 * ========================================
 * AniKuro API Documentation
 * ========================================
 * Complete API reference with examples
 */

// Base URL: http://localhost:5000/api/v1

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

/**
 * @POST /auth/register
 * @description Register a new user account
 * @body { username: string, password: string }
 * @returns { success: boolean, message: string }
 * 
 * @example
 * curl -X POST http://localhost:5000/api/v1/auth/register \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"otakufan","password":"secure123"}'
 */

/**
 * @POST /auth/login
 * @description Login user account
 * @body { username: string, password: string }
 * @returns { success: boolean, message: string, data: { username, watchlistCount } }
 * 
 * @example
 * curl -X POST http://localhost:5000/api/v1/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"username":"otakufan","password":"secure123"}'
 */

// ========================================
// WATCHLIST ENDPOINTS
// ========================================

/**
 * @GET /users/:username/watchlist
 * @description Get user's watchlist
 * @params username (string)
 * @returns { success: boolean, message: string, data: [mediaIds] }
 * 
 * @example
 * curl http://localhost:5000/api/v1/users/otakufan/watchlist
 */

/**
 * @POST /users/:username/watchlist/toggle
 * @description Add/Remove anime from watchlist
 * @params username (string)
 * @body { mediaId: number }
 * @returns { success: boolean, message: string }
 * 
 * @example
 * curl -X POST http://localhost:5000/api/v1/users/otakufan/watchlist/toggle \
 *   -H "Content-Type: application/json" \
 *   -d '{"mediaId":16498}'
 */

// ========================================
// ANILIST PROXY ENDPOINTS
// ========================================

/**
 * @POST /anilist/search
 * @description Search anime by title
 * @body { searchTerm: string, page?: number, perPage?: number }
 * @returns { success: boolean, message: string, data: [anime] }
 * 
 * @example
 * curl -X POST http://localhost:5000/api/v1/anilist/search \
 *   -H "Content-Type: application/json" \
 *   -d '{"searchTerm":"Attack on Titan","page":1,"perPage":12}'
 */

/**
 * @GET /anilist/trending
 * @description Get trending anime
 * @query page (1-100), perPage (1-50)
 * @returns { success: boolean, message: string, data: [anime] }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/anilist/trending?page=1&perPage=12"
 */

/**
 * @GET /anilist/popular
 * @description Get popular anime
 * @query page (1-100), perPage (1-50)
 * @returns { success: boolean, message: string, data: [anime] }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/anilist/popular?page=1&perPage=12"
 */

/**
 * @GET /anilist/airing
 * @description Get same-day airing schedule (24-hour window)
 * @returns { success: boolean, message: string, data: [airingSchedules] }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/anilist/airing"
 */

/**
 * @GET /anilist/media/:id
 * @description Get detailed anime information
 * @params id (number) - AniList media ID
 * @returns { success: boolean, message: string, data: mediaDetails }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/anilist/media/16498"
 */

/**
 * @GET /anilist/categories/:category
 * @description Get anime by category
 * @params category (string) - 'chinese', 'korean', 'movies'
 * @query page (1-100), perPage (1-50)
 * @returns { success: boolean, message: string, data: [anime] }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/anilist/categories/chinese?page=1&perPage=10"
 * curl "http://localhost:5000/api/v1/anilist/categories/korean?page=1&perPage=10"
 * curl "http://localhost:5000/api/v1/anilist/categories/movies?page=1&perPage=10"
 */

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================

/**
 * @GET /health
 * @description Check server status
 * @returns { status: string, uptime: number, timestamp: string }
 * 
 * @example
 * curl "http://localhost:5000/api/v1/health"
 */

// ========================================
// ERROR RESPONSES
// ========================================

/**
 * 400 Bad Request
 * { success: false, message: "Invalid input" }
 * 
 * 401 Unauthorized
 * { success: false, message: "Authorization token required" }
 * 
 * 404 Not Found
 * { success: false, message: "Resource not found" }
 * 
 * 409 Conflict
 * { success: false, message: "Resource already exists" }
 * 
 * 500 Internal Server Error
 * { success: false, message: "Internal server error" }
 */

module.exports = {};
