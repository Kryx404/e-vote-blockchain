// defisi tipe transaksi blockchain
package app

type TxCommit struct {
	Kind       string `json:"kind"`
	CredID     string `json:"cred_id"`
	Commitment string `json:"commitment"`
}
type TxReveal struct {
	Kind   string `json:"kind"`
	CredID string `json:"cred_id"`
	Salt   string `json:"salt"`
	Choice string `json:"choice"`
}
type baseKind struct {
	Kind string `json:"kind"`
}
