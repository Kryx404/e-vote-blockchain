package app

import (
	"context"
	"encoding/json"
	"log"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

func (a *App) FinalizeBlock(ctx context.Context, req *abcitypes.FinalizeBlockRequest) (*abcitypes.FinalizeBlockResponse, error) {
	results := make([]*abcitypes.ExecTxResult, 0, len(req.Txs))

	for _, txBytes := range req.Txs {
		res := &abcitypes.ExecTxResult{Code: 1}

		var bk baseKind
		if err := json.Unmarshal(txBytes, &bk); err != nil {
			res.Log = "bad json"
			results = append(results, res)
			continue
		}

		switch bk.Kind {
		case "commit":
			var tx TxCommit
			if err := json.Unmarshal(txBytes, &tx); err != nil {
				res.Log = "bad commit json"
				break
			}
			a.mu.Lock()
			if _, exists := a.commits[tx.CredID]; exists {
				a.mu.Unlock()
				res.Log = "double commit"
				break
			}
			a.commits[tx.CredID] = tx.Commitment
			a.mu.Unlock()
			res.Code = 0

		case "reveal":
			var tx TxReveal
			if err := json.Unmarshal(txBytes, &tx); err != nil {
				res.Log = "bad reveal json"
				break
			}

			a.mu.RLock()
			expect := a.commits[tx.CredID]
			already := a.revealed[tx.CredID]
			a.mu.RUnlock()

			got := shaHex([]byte(tx.Salt + "|" + tx.Choice + "|" + tx.CredID))
			log.Printf("Reveal debug => cred=%s\n expect=%s\n got   =%s\n", tx.CredID, expect, got)

			if already {
				res.Log = "double reveal"
				break
			}
			if expect == "" || expect != got {
				res.Log = "commit mismatch"
				break
			}

			a.mu.Lock()
			a.revealed[tx.CredID] = true
			a.tally[tx.Choice]++
			a.mu.Unlock()
			res.Code = 0

		default:
			res.Log = "unknown kind"
		}

		results = append(results, res)
	}

	// AppHash deterministik
	a.appHash = a.calcAppHash()
	return &abcitypes.FinalizeBlockResponse{
		TxResults: results,
		AppHash:   a.appHash,
	}, nil
}
