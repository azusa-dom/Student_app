// src/config/api.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    ACTIVITIES: '/activities',
    CLUB_ACTIVITIES: '/activities/club',
    CAREER_ACTIVITIES: '/activities/career',
    REFRESH: '/activities/refresh',
    HEALTH: '/health'
  }
};

export function buildApiUrl(path) {
  return `${API_CONFIG.BASE_URL}${path}`;
}

