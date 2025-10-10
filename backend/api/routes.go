package main

import "net/http"

// RegisterRoutes mendaftarkan semua endpoint HTTP (dipisah supaya main.go bersih)
func RegisterRoutes(mux *http.ServeMux) {
    // route utama
    mux.HandleFunc("/vote/commit", commit)
    mux.HandleFunc("/vote/reveal", reveal)
    mux.HandleFunc("/tally", tally)
    mux.HandleFunc("/login", loginHandler)

}