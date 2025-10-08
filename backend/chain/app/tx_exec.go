// eksekusi hasil akhir transaksi blockchain
package app

import (
	"context"
	"encoding/json"
	"log"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

// Eksekusi hasil akhir transaksi
func (a *App) FinalizeBlock(ctx context.Context, req *abcitypes.FinalizeBlockRequest) (*abcitypes.FinalizeBlockResponse, error) {
	results := make([]*abcitypes.ExecTxResult, 0, len(req.Txs))

	// eksekusi tiap transaksi
	for _, txBytes := range req.Txs {
		res := &abcitypes.ExecTxResult{Code: 1}

		var bk baseKind
		if err := json.Unmarshal(txBytes, &bk); err != nil {
			res.Log = "bad json"
			results = append(results, res)
			continue
		}

		// eksekusi sesuai jenis
		switch bk.Kind {
		case "commit":
			var tx TxCommit
			if err := json.Unmarshal(txBytes, &tx); err != nil {
				res.Log = "bad commit json"
				break
			}
			
			// cek double commit
			a.mu.Lock()
			if _, exists := a.commits[tx.CredID]; exists {
				a.mu.Unlock()
				res.Log = "double commit"
				break
			}

			// catat commitment
			a.commits[tx.CredID] = tx.Commitment
			a.mu.Unlock()
			res.Code = 0

		case "reveal":
			var tx TxReveal
			if err := json.Unmarshal(txBytes, &tx); err != nil {
				res.Log = "bad reveal json"
				break
			}

			// cek commitment
			a.mu.RLock()
			expect := a.commits[tx.CredID]
			already := a.revealed[tx.CredID]
			a.mu.RUnlock()

			// hitung ulang hash
			got := shaHex([]byte(tx.Salt + "|" + tx.Choice + "|" + tx.CredID))
			log.Printf("Reveal debug => cred=%s\n expect=%s\n got   =%s\n", tx.CredID, expect, got)

			// cek double reveal
			if already {
				res.Log = "double reveal"
				break
			}
			// commitment harus cocok
			if expect == "" || expect != got {
				res.Log = "commit mismatch"
				break
			}

			// catat sudah reveal & hitung suara
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
