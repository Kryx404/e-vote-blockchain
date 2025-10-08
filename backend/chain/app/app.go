// smart contract utama untuk e-vote
package app

import (
	"bytes"
	"context"
	"crypto/sha256"
	"fmt"
	"sort"
	"sync"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

type App struct {
	abcitypes.BaseApplication
	mu       sync.RWMutex
	commits  map[string]string // cred_id -> commitment
	revealed map[string]bool   // cred_id sudah reveal?
	tally    map[string]int    // choice -> count
	appHash  []byte
}

// Buat 
func NewApp() *App {
	return &App{
		commits:  map[string]string{},
		revealed: map[string]bool{},
		tally:    map[string]int{},
		appHash:  []byte{},
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
	for k := range a.tally { keys = append(keys, k) }
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
	// RetainHeight 0 untuk demo
	return &abcitypes.CommitResponse{RetainHeight: 0}, nil
}
