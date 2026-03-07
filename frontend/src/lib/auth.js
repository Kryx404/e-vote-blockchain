export function readAuth() {
    if (typeof window === "undefined") return { token: null, email: null };
    return {
        token: localStorage.getItem("token"),
        email: localStorage.getItem("email"),
    };
}

export function clearAuth() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("email");
}

export function isAuthenticated() {
    return Boolean(readAuth().token);
}
