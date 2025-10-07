package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

func env(k, def string) string { if v := os.Getenv(k); v != "" { return v }; return def }
var cometRPC = env("COMET_RPC", "http://localhost:26657")

type commitReq struct {
    CredID string `json:"cred_id"`
    Choice string `json:"choice"`
}

type revealReq struct {
    CredID string `json:"cred_id"`
    Salt   string `json:"salt"`
    Choice string `json:"choice"`
}


func shaHex(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

func jsonRPC(method string, params any) (map[string]any, error) {
	body := map[string]any{"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
	b, _ := json.Marshal(body)
	resp, err := http.Post(cometRPC, "application/json", bytes.NewReader(b))
	if err != nil { return nil, err }
	defer resp.Body.Close()
	var out map[string]any
	json.NewDecoder(resp.Body).Decode(&out)
	return out, nil
}

func broadcast(tx any) (map[string]any, error) {
	raw, _ := json.Marshal(tx)
	b64 := base64.StdEncoding.EncodeToString(raw) // ← pakai base64
	return jsonRPC("broadcast_tx_commit", []any{b64})
}

func commit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { w.WriteHeader(405); return }
	var in commitReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil { http.Error(w, "bad json", 400); return }
	// DEMO: salt dummy. Produksi → generate acak di klien & simpan.
	salt := "demo_salt"
	com := shaHex(fmt.Sprintf("%s|%s|%s", salt, in.Choice, in.CredID))
	tx := map[string]string{"kind": "commit", "cred_id": in.CredID, "commitment": com}
	res, err := broadcast(tx)
	if err != nil { http.Error(w, err.Error(), 500); return }
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "salt": salt, "rpc": res})
}

func reveal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost { w.WriteHeader(405); return }
	var in revealReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil { http.Error(w, "bad json", 400); return }
	tx := map[string]string{"kind": "reveal", "cred_id": in.CredID, "salt": in.Salt, "choice": in.Choice}
	res, err := broadcast(tx)
	if err != nil { http.Error(w, err.Error(), 500); return }
	json.NewEncoder(w).Encode(map[string]any{"ok": true, "rpc": res})
}

func tally(w http.ResponseWriter, r *http.Request) {
	res, err := jsonRPC("abci_query", map[string]any{"path": "/tally"})
	if err != nil { http.Error(w, err.Error(), 500); return }
	json.NewEncoder(w).Encode(res)
}

func main() {
	http.HandleFunc("/vote/commit", commit)
	http.HandleFunc("/vote/reveal", reveal)
	http.HandleFunc("/tally",       tally)
	log.Println("REST API on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
