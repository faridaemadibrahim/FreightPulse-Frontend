import axios from "axios";

export const getApiBase = () => {
  if (typeof window !== "undefined") {
    // In browser: use relative URL /api/v1 so Next.js rewrites proxy it without CORS preflight issues
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
};

export const getApiKey = () =>
  process.env.NEXT_PUBLIC_API_KEY || "dev-api-key";

export const isMockMode = () =>
  process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export const apiClient = axios.create({
  timeout: 10000,
});

// Interceptor to dynamically set baseURL and headers on each request
apiClient.interceptors.request.use((config) => {
  const base = getApiBase();
  config.baseURL = base;
  config.headers["Content-Type"] = "application/json";
  config.headers["X-API-Key"] = getApiKey();

  if (config.url && config.url.startsWith("/api/v1") && base.endsWith("/api/v1")) {
    config.url = config.url.replace(/^\/api\/v1/, "");
  }

  return config;
});
