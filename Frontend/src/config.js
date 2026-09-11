// Central application configuration
// In development, empty API_BASE lets Vite dev proxy forward calls to localhost:8000.
// In production on Vercel, VITE_API_BASE_URL (e.g. https://beacon-backend.onrender.com) points calls to Render.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
