/**
 * ========================================
 * AniKuro Backend - Production Server
 * ========================================
 * Node.js Express API for anime streaming platform
 * Integrates with AniList GraphQL API
 * Handles user authentication, watchlists, and media caching
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ========================================
// SIMULATED DATABASE (Replace with actual DB like MongoDB/PostgreSQL)
// ========================================
const userDatabase = new Map();
const mediaCache = new Map();

// Pre-populate sample accounts
userDatabase.set('kuroneko', {
    username: 'kuroneko',
    password: 'cipher123',
    watchlist: [153518, 16498, 113415],
    createdAt: new Date()
});

userDatabase.set('otakuking', {
    username: 'otakuking',
    password: 'otaku99',
    watchlist: [16498],
    createdAt: new Date()
});

// ========================================
// ANILIST GRAPHQL API INTEGRATION
// ========================================
const ANILIST_API_URL = 'https://graphql.anilist.co';

async function fetchAniListData(query, variables = {}) {
    try {
        const response = await axios.post(ANILIST_API_URL, {
            query: query,
            variables: variables
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });

        if (response.data.errors) {
            console.error('AniList GraphQL Error:', response.data.errors);
            return null;
        }

        return response.data.data;
    } catch (error) {
        console.error('AniList API Connection Error:', error.message);
        return null;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function isValidUsername(username) {
    return username && username.trim().length >= 3;
}

function isValidPassword(password) {
    return password && password.trim().length >= 4;
}

function createSuccessResponse(success, message, data = null) {
    const response = { success, message };
    if (data !== null) response.data = data;
    return response;
}

// ========================================
// AUTH ENDPOINTS
// ========================================

// @POST /api/v1/auth/register
// Register new user account
app.post('/api/v1/auth/register', (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!isValidUsername(username)) {
        return res.status(400).json(
            createSuccessResponse(false, 'Invalid username configuration. Must exceed 3 characters.')
        );
    }

    if (!isValidPassword(password)) {
        return res.status(400).json(
            createSuccessResponse(false, 'Invalid password configuration. Must exceed 4 characters.')
        );
    }

    // Check if user already exists
    if (userDatabase.has(username.trim().toLowerCase())) {
        return res.status(409).json(
            createSuccessResponse(false, 'Otaku ID is currently registered on Vercel cluster.')
        );
    }

    // Create new user
    const newUser = {
        username: username.trim().toLowerCase(),
        password: password, // In production, use bcrypt for hashing!
        watchlist: [],
        createdAt: new Date()
    };

    userDatabase.set(newUser.username, newUser);

    return res.status(201).json(
        createSuccessResponse(true, 'Authentication Gateway Ready. Account created successfully.')
    );
});

// @POST /api/v1/auth/login
// User login endpoint
app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json(
            createSuccessResponse(false, 'Username and password required.')
        );
    }

    const user = userDatabase.get(username.trim().toLowerCase());

    if (user && user.password === password) {
        return res.json(
            createSuccessResponse(true, 'Authentication tokens verified. Session synchronized.', {
                username: user.username,
                watchlistCount: user.watchlist.length
            })
        );
    }

    return res.status(401).json(
        createSuccessResponse(false, 'Access Denied. Cryptographic configuration error.')
    );
});

// ========================================
// WATCHLIST ENDPOINTS
// ========================================

// @GET /api/v1/users/:username/watchlist
// Retrieve user's watchlist
app.get('/api/v1/users/:username/watchlist', (req, res) => {
    const { username } = req.params;
    const user = userDatabase.get(username.trim().toLowerCase());

    if (!user) {
        return res.status(404).json(
            createSuccessResponse(false, 'User session not active.')
        );
    }

    // Sort watchlist (latest first)
    const sortedWatchlist = [...user.watchlist].sort((a, b) => b - a);

    return res.json(
        createSuccessResponse(true, 'Watchlist retrieved successfully.', sortedWatchlist)
    );
});

// @POST /api/v1/users/:username/watchlist/toggle
// Add/Remove anime from watchlist
app.post('/api/v1/users/:username/watchlist/toggle', (req, res) => {
    const { username } = req.params;
    const { mediaId } = req.body;

    if (!mediaId || isNaN(mediaId)) {
        return res.status(400).json(
            createSuccessResponse(false, 'Invalid media ID provided.')
        );
    }

    const user = userDatabase.get(username.trim().toLowerCase());

    if (!user) {
        return res.status(404).json(
            createSuccessResponse(false, 'Session credentials invalid.')
        );
    }

    const mediaIdNum = parseInt(mediaId);
    const alreadyTracked = user.watchlist.includes(mediaIdNum);

    if (alreadyTracked) {
        user.watchlist = user.watchlist.filter(id => id !== mediaIdNum);
        return res.json(
            createSuccessResponse(true, 'Tracker removed from Vercel persistent storage.')
        );
    } else {
        user.watchlist.push(mediaIdNum);
        return res.json(
            createSuccessResponse(true, 'Tracker synced securely to Vercel persistent database.')
        );
    }
});

// ========================================
// ANILIST API PROXY ENDPOINTS
// ========================================

// @POST /api/v1/anilist/search
// Search anime using AniList GraphQL
app.post('/api/v1/anilist/search', async (req, res) => {
    const { searchTerm, page = 1, perPage = 12 } = req.body;

    if (!searchTerm) {
        return res.status(400).json(
            createSuccessResponse(false, 'Search term is required.')
        );
    }

    const query = `
        query ($search: String, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(search: $search, type: ANIME) {
                    id
                    title { english romaji }
                    coverImage { large extraLarge }
                    averageScore
                    seasonYear
                    genres
                    description
                }
            }
        }
    `;

    const data = await fetchAniListData(query, {
        search: searchTerm,
        page: parseInt(page),
        perPage: parseInt(perPage)
    });

    if (!data) {
        return res.status(500).json(
            createSuccessResponse(false, 'AniList API connection failed.')
        );
    }

    return res.json(
        createSuccessResponse(true, 'Search completed successfully.', data.Page.media)
    );
});

// @GET /api/v1/anilist/trending
// Get trending anime
app.get('/api/v1/anilist/trending', async (req, res) => {
    const { page = 1, perPage = 12 } = req.query;

    const query = `
        query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(sort: TRENDING_DESC, type: ANIME) {
                    id
                    title { english romaji }
                    coverImage { large extraLarge }
                    averageScore
                    seasonYear
                    genres
                    bannerImage
                }
            }
        }
    `;

    const data = await fetchAniListData(query, {
        page: parseInt(page),
        perPage: parseInt(perPage)
    });

    if (!data) {
        return res.status(500).json(
            createSuccessResponse(false, 'AniList API connection failed.')
        );
    }

    return res.json(
        createSuccessResponse(true, 'Trending anime fetched successfully.', data.Page.media)
    );
});

// @GET /api/v1/anilist/popular
// Get popular anime
app.get('/api/v1/anilist/popular', async (req, res) => {
    const { page = 1, perPage = 12 } = req.query;

    const query = `
        query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(sort: POPULARITY_DESC, type: ANIME) {
                    id
                    title { english romaji }
                    coverImage { large extraLarge }
                    averageScore
                    seasonYear
                    genres
                }
            }
        }
    `;

    const data = await fetchAniListData(query, {
        page: parseInt(page),
        perPage: parseInt(perPage)
    });

    if (!data) {
        return res.status(500).json(
            createSuccessResponse(false, 'AniList API connection failed.')
        );
    }

    return res.json(
        createSuccessResponse(true, 'Popular anime fetched successfully.', data.Page.media)
    );
});

// @GET /api/v1/anilist/airing
// Get same-day airing schedule
app.get('/api/v1/anilist/airing', async (req, res) => {
    const now = Math.floor(Date.now() / 1000);
    const airingStart = now - 86400; // 24 hours ago
    const airingEnd = now + 86400;   // 24 hours from now

    const query = `
        query ($airingStart: Int, $airingEnd: Int) {
            Page(page: 1, perPage: 12) {
                airingSchedules(airingAt_greater: $airingStart, airingAt_lesser: $airingEnd, sort: TIME_DESC) {
                    media {
                        id
                        title { english romaji }
                        coverImage { large }
                        averageScore
                        seasonYear
                        genres
                    }
                    episode
                    airingAt
                }
            }
        }
    `;

    const data = await fetchAniListData(query, {
        airingStart,
        airingEnd
    });

    if (!data) {
        return res.status(500).json(
            createSuccessResponse(false, 'AniList API connection failed.')
        );
    }

    return res.json(
        createSuccessResponse(true, 'Airing schedule fetched successfully.', data.Page.airingSchedules)
    );
});

// @GET /api/v1/anilist/media/:id
// Get detailed anime information
app.get('/api/v1/anilist/media/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json(
            createSuccessResponse(false, 'Invalid media ID.')
        );
    }

    const query = `
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                title { english romaji }
                coverImage { large extraLarge }
                bannerImage
                description
                averageScore
                episodes
                genres
                seasonYear
                studios { nodes { name } }
                status
            }
        }
    `;

    const data = await fetchAniListData(query, { id: parseInt(id) });

    if (!data || !data.Media) {
        return res.status(404).json(
            createSuccessResponse(false, 'Anime not found in AniList database.')
        );
    }

    return res.json(
        createSuccessResponse(true, 'Media details retrieved successfully.', data.Media)
    );
});

// @GET /api/v1/anilist/categories/:category
// Get anime by category (chinese, korean, movies)
app.get('/api/v1/anilist/categories/:category', async (req, res) => {
    const { category } = req.params;
    const { page = 1, perPage = 10 } = req.query;

    let query = '';

    if (category === 'chinese') {
        query = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(countryOfOrigin: "CN", type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title { english romaji }
                        coverImage { large }
                        averageScore
                        seasonYear
                        genres
                    }
                }
            }
        `;
    } else if (category === 'korean') {
        query = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(countryOfOrigin: "KR", type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title { english romaji }
                        coverImage { large }
                        averageScore
                        seasonYear
                        genres
                    }
                }
            }
        `;
    } else if (category === 'movies') {
        query = `
            query ($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    media(format: MOVIE, type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title { english romaji }
                        coverImage { large }
                        averageScore
                        seasonYear
                        genres
                    }
                }
            }
        `;
    } else {
        return res.status(400).json(
            createSuccessResponse(false, 'Invalid category. Use: chinese, korean, or movies.')
        );
    }

    const data = await fetchAniListData(query, {
        page: parseInt(page),
        perPage: parseInt(perPage)
    });

    if (!data) {
        return res.status(500).json(
            createSuccessResponse(false, 'AniList API connection failed.')
        );
    }

    return res.json(
        createSuccessResponse(true, `${category.toUpperCase()} category fetched successfully.`, data.Page.media)
    );
});

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'AniKuro Backend Operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json(
        createSuccessResponse(false, 'Internal server error occurred.')
    );
});

// ========================================
// 404 HANDLER
// ========================================
app.use((req, res) => {
    res.status(404).json(
        createSuccessResponse(false, 'Endpoint not found.')
    );
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║     AniKuro Backend Server Active      ║
    ║     Listening on port ${PORT}           ║
    ║     GraphQL AniList API Proxied        ║
    ╚═══════════════════════════════════════╝
    `);
});

module.exports = app;
