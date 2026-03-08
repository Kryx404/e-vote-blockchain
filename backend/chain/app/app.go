// smart contract utama untuk e-vote
package app

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sort"
	"sync"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

// stateFile adalah path file JSON untuk menyimpan state vote secara persisten
var stateFile = func() string {
	if v := os.Getenv("STATE_FILE"); v != "" {
		return v
	}
	return "/data/evote_state.json"
}()

// persistState menyimpan state ke disk (tidak perlu kunci karena dipanggil setelah acquire)
type persistedState struct {
	Commits  map[string]string `json:"commits"`
	Revealed map[string]bool   `json:"revealed"`
	Tally    map[string]int    `json:"tally"`
}

type App struct {
	abcitypes.BaseApplication
	mu       sync.RWMutex
	commits  map[string]string // cred_id -> commitment
	revealed map[string]bool   // cred_id sudah reveal?
	tally    map[string]int    // choice -> count
	appHash  []byte
}

// Buat App, load state dari disk jika ada
func NewApp() *App {
	a := &App{
		commits:  map[string]string{},
		revealed: map[string]bool{},
		tally:    map[string]int{},
		appHash:  []byte{},
	}
	a.loadState()
	return a
}

// loadState membaca state dari file JSON
func (a *App) loadState() {
	data, err := os.ReadFile(stateFile)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("⚠️  Gagal baca state file: %v", err)
		}
		return
	}
	var s persistedState
	if err := json.Unmarshal(data, &s); err != nil {
		log.Printf("⚠️  Gagal parse state file: %v", err)
		return
	}
	if s.Commits != nil {
		a.commits = s.Commits
	}
	if s.Revealed != nil {
		a.revealed = s.Revealed
	}
	if s.Tally != nil {
		a.tally = s.Tally
	}
	log.Printf("✅ State loaded: %d commits, %d revealed, tally=%v", len(a.commits), len(a.revealed), a.tally)
}

// saveState menulis state ke file JSON (harus dipanggil saat mu sudah di-lock)
func (a *App) saveState() {
	s := persistedState{
		Commits:  a.commits,
		Revealed: a.revealed,
		Tally:    a.tally,
	}
	data, err := json.Marshal(s)
	if err != nil {
		log.Printf("⚠️  Gagal marshal state: %v", err)
		return
	}
	// Tulis ke temp file dulu, lalu rename agar atomic
	tmp := stateFile + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		log.Printf("⚠️  Gagal tulis state file: %v", err)
		return
	}
	if err := os.Rename(tmp, stateFile); err != nil {
		log.Printf("⚠️  Gagal rename state file: %v", err)
	}
}

// Hash dari byte slice
func shaHex(b []byte) string {
	sum := sha256.Sum256(b)
	return fmt.Sprintf("%x", sum[:])
}

// AppHash deterministik (urutkan key)
func (a *App) calcAppHash() []byte {
	a.mu.RLock()
	defer a.mu.RUnlock()
	keys := make([]string, 0, len(a.tally))
	for k := range a.tally {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var buf bytes.Buffer
	for _, k := range keys {
		fmt.Fprintf(&buf, "%s=%d;", k, a.tally[k])
	}
	sum := sha256.Sum256(buf.Bytes())
	out := make([]byte, len(sum))
	copy(out, sum[:])
	return out
}

/* ---------- optional: ABCI 2.0 Info/Commit ---------- */

// Laporkan Info
func (a *App) Info(ctx context.Context, req *abcitypes.InfoRequest) (*abcitypes.InfoResponse, error) {
	return &abcitypes.InfoResponse{Data: "e-vote-go", Version: "0.2-abci2"}, nil
}

// Commit
func (a *App) Commit(ctx context.Context, _ *abcitypes.CommitRequest) (*abcitypes.CommitResponse, error) {
	// Simpan state ke disk setiap kali block di-commit
	a.mu.RLock()
	a.saveState()
	a.mu.RUnlock()
	return &abcitypes.CommitResponse{RetainHeight: 0}, nil
}
