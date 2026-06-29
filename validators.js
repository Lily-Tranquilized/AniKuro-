/**
 * ========================================
 * AniKuro Validation Utilities
 * ========================================
 * Input validation helpers
 */

const config = require('./config');

const validators = {
    username: (username) => {
        if (!username || typeof username !== 'string') return false;
        const trimmed = username.trim();
        return trimmed.length >= config.security.usernameMinLength && trimmed.length <= 50;
    },

    password: (password) => {
        if (!password || typeof password !== 'string') return false;
        return password.length >= config.security.passwordMinLength && password.length <= 128;
    },

    mediaId: (id) => {
        return Number.isInteger(id) && id > 0;
    },

    page: (page) => {
        const num = parseInt(page);
        return num >= config.pagination.defaultPage && num <= 100;
    },

    perPage: (perPage) => {
        const num = parseInt(perPage);
        return num > 0 && num <= config.pagination.maxPerPage;
    },

    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

const sanitizers = {
    string: (str) => {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    },

    username: (username) => {
        return sanitizers.string(username).toLowerCase();
    },

    searchTerm: (term) => {
        return sanitizers.string(term).substring(0, 100);
    }
};

module.exports = {
    validators,
    sanitizers
};
