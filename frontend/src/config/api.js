// Centralized Dynamic Cross-Device API Configuration for Digi Law Reporter
const getApiHost = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) 
    ? window.location.hostname 
    : 'localhost';
  return `http://${host}:5000/api`;
};

export const API_BASE_URL = getApiHost();
export const API_ORIGIN = (typeof window !== 'undefined' && window.location && window.location.hostname) 
  ? `http://${window.location.hostname}:5000` 
  : 'http://localhost:5000';
