/**
 * ========================================
 * AniKuro AniList API Service
 * ========================================
 * Centralized AniList GraphQL queries
 */

const axios = require('axios');
const config = require('./config');

const ANILIST_URL = config.anilist.graphqlUrl;

class AniListService {
    static async query(queryString, variables = {}) {
        try {
            const response = await axios.post(
                ANILIST_URL,
                {
                    query: queryString,
                    variables: variables
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: config.anilist.timeout
                }
            );

            if (response.data.errors) {
                console.error('AniList GraphQL Error:', response.data.errors);
                return { error: true, message: response.data.errors[0].message };
            }

            return { error: false, data: response.data.data };
        } catch (error) {
            console.error('AniList API Error:', error.message);
            return { error: true, message: 'Failed to connect to AniList API' };
        }
    }

    static async getHeroShowcase() {
        const query = `
            query {
                Page(page: 1, perPage: 1) {
                    media(sort: TRENDING_DESC, type: ANIME) {
                        id
                        title { english romaji }
                        bannerImage
                        coverImage { extraLarge }
                        description
                        averageScore
                        seasonYear
                    }
                }
            }
        `;
        return this.query(query);
    }

    static async searchAnime(searchTerm, page = 1, perPage = 12) {
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
        return this.query(query, { search: searchTerm, page, perPage });
    }

    static async getTrendingAnime(page = 1, perPage = 12) {
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
        return this.query(query, { page, perPage });
    }

    static async getPopularAnime(page = 1, perPage = 12) {
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
        return this.query(query, { page, perPage });
    }

    static async getAiringNow() {
        const now = Math.floor(Date.now() / 1000);
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
        return this.query(query, {
            airingStart: now - 86400,
            airingEnd: now + 86400
        });
    }

    static async getMediaById(id) {
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
        return this.query(query, { id });
    }

    static async getChineseAnime(page = 1, perPage = 10) {
        const query = `
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
        return this.query(query, { page, perPage });
    }

    static async getKoreanAnime(page = 1, perPage = 10) {
        const query = `
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
        return this.query(query, { page, perPage });
    }

    static async getMovies(page = 1, perPage = 10) {
        const query = `
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
        return this.query(query, { page, perPage });
    }

    static async getWatchlistData(mediaIds) {
        if (!mediaIds || mediaIds.length === 0) return { error: false, data: { Page: { media: [] } } };

        const query = `
            query ($ids: [Int]) {
                Page(page: 1, perPage: 20) {
                    media(id_in: $ids, type: ANIME) {
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
        return this.query(query, { ids: mediaIds });
    }
}

module.exports = AniListService;
