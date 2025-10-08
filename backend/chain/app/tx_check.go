// memeriksa validitas transaksi sebelum dimasukkan ke dalam blok
package app

import (
	"context"
	"encoding/json"
	"log"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

// Periksa validitas transaksi
func (a *App) CheckTx(ctx context.Context, req *abcitypes.CheckTxRequest) (*abcitypes.CheckTxResponse, error) {
	var bk baseKind
	if err := json.Unmarshal(req.Tx, &bk); err != nil {
		return &abcitypes.CheckTxResponse{Code: 1, Log: "bad json"}, nil
	}

	// periksa sesuai jenis
	switch bk.Kind {
	case "commit":
		var tx TxCommit
		_ = json.Unmarshal(req.Tx, &tx)
		a.mu.RLock()
		_, exists := a.commits[tx.CredID]
		a.mu.RUnlock()
		if exists {
			return &abcitypes.CheckTxResponse{Code: 1, Log: "double commit"}, nil
		}

		// validasi format commitment
	case "reveal":
		var tx TxReveal
		_ = json.Unmarshal(req.Tx, &tx)

		// cek commitment & sudah reveal
		a.mu.RLock()
		expect := a.commits[tx.CredID]
		rev := a.revealed[tx.CredID]
		a.mu.RUnlock()

		// cek commitment
		got := shaHex([]byte(tx.Salt + "|" + tx.Choice + "|" + tx.CredID))
		log.Printf("CheckTx debug => cred_id=%s\nexpect=%s\ngot    =%s\n", tx.CredID, expect, got)

		// validasi double reveal & kecocokan
		if rev {
			return &abcitypes.CheckTxResponse{Code: 1, Log: "double reveal"}, nil
		}
		// validasi commitment harus cocok
		if expect == "" || expect != got {
			return &abcitypes.CheckTxResponse{Code: 1, Log: "commit mismatch"}, nil
		}

	default:
		return &abcitypes.CheckTxResponse{Code: 1, Log: "unknown kind"}, nil
	}

	return &abcitypes.CheckTxResponse{Code: 0}, nil
}
