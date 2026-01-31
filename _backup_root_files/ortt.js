// API Configuration
let api_url = import.meta.env.VITE_API_URL || 'https://onyourhelp.vercel.app';

// Remove trailing slash if present
if (api_url.endsWith('/')) {
    api_url = api_url.slice(0, -1);
}

export const API_URL = api_url;
