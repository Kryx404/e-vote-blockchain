package app

import (
	"context"
	"encoding/json"
	"log"

	abcitypes "github.com/cometbft/cometbft/abci/types"
)

func (a *App) CheckTx(ctx context.Context, req *abcitypes.CheckTxRequest) (*abcitypes.CheckTxResponse, error) {
	var bk baseKind
	if err := json.Unmarshal(req.Tx, &bk); err != nil {
		return &abcitypes.CheckTxResponse{Code: 1, Log: "bad json"}, nil
	}

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

	case "reveal":
		var tx TxReveal
		_ = json.Unmarshal(req.Tx, &tx)

		a.mu.RLock()
		expect := a.commits[tx.CredID]
		rev := a.revealed[tx.CredID]
		a.mu.RUnlock()

		got := shaHex([]byte(tx.Salt + "|" + tx.Choice + "|" + tx.CredID))
		log.Printf("CheckTx debug => cred_id=%s\nexpect=%s\ngot    =%s\n", tx.CredID, expect, got)

		if rev {
			return &abcitypes.CheckTxResponse{Code: 1, Log: "double reveal"}, nil
		}
		if expect == "" || expect != got {
			return &abcitypes.CheckTxResponse{Code: 1, Log: "commit mismatch"}, nil
		}

	default:
		return &abcitypes.CheckTxResponse{Code: 1, Log: "unknown kind"}, nil
	}

	return &abcitypes.CheckTxResponse{Code: 0}, nil
}
