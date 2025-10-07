import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// inject token from localStorage
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // ignore (SSR or blocked)
    }
    return config;
});

export default api;
