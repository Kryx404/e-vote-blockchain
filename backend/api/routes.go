package main

import "net/http"

// RegisterRoutes mendaftarkan semua endpoint HTTP (dipisah supaya main.go bersih)
func RegisterRoutes(mux *http.ServeMux) {
    // route utama
    mux.HandleFunc("/vote/commit", commit)
    mux.HandleFunc("/vote/reveal", reveal)
    mux.HandleFunc("/vote/status", statusHandler) 
    mux.HandleFunc("/tally", tally)
    mux.HandleFunc("/login", loginHandler)

    // kompatibilitas frontend yang menggunakan prefix /api/v1
    mux.HandleFunc("/api/v1/vote/commit", commit)
    mux.HandleFunc("/api/v1/vote/reveal", reveal)
    mux.HandleFunc("/api/v1/vote/status", statusHandler) 
    mux.HandleFunc("/api/v1/tally", tally)
    mux.HandleFunc("/api/v1/login", loginHandler)
}