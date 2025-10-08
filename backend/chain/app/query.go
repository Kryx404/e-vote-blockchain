// handle query dari client
package app

import (
	"context"
	"encoding/json"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

// Handle query dari client
func (a *App) Query(ctx context.Context, req *abcitypes.QueryRequest) (*abcitypes.QueryResponse, error) {
	switch req.Path {
	case "/tally":
		a.mu.RLock()
		b, _ := json.Marshal(a.tally)
		a.mu.RUnlock()
		return &abcitypes.QueryResponse{Code: 0, Value: b}, nil
	default:
		return &abcitypes.QueryResponse{Code: 0, Value: []byte("ok")}, nil
	}
}
