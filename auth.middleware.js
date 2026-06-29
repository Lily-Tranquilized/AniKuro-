/**
 * ========================================
 * AniKuro Authentication Middleware
 * ========================================
 * JWT and session-based authentication
 */

const config = require('./config');

// Mock JWT verification (replace with jsonwebtoken in production)
function verifyToken(token) {
    try {
        // In production, use: jwt.verify(token, config.security.jwtSecret)
        if (!token || token.length < 10) {
            return null;
        }
        // Decode payload (demo only)
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64'));
    } catch (error) {
        return null;
    }
}

function generateToken(payload) {
    // In production, use: jwt.sign(payload, config.security.jwtSecret, { expiresIn: config.security.jwtExpire })
    const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = Buffer.from('demo-signature').toString('base64');
    return `${header}.${body}.${signature}`;
}

// Authentication middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token required'
        });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    req.user = payload;
    next();
}

// Optional auth middleware (doesn't fail if no token)
function optionalAuthMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    verifyToken,
    generateToken
};
