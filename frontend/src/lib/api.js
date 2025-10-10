import axios from "axios";

// gunakan relative base supaya rewrites Next.js tetap bekerja
const api = axios.create({
    baseURL: "/api/v1",
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

// tambahkan Authorization header dari localStorage setiap request
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers = config.headers || {};
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (err) => Promise.reject(err),
);

export default api;
