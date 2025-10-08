// autentikasi user dengan token HMAC
package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"os"
	"strconv"
	"strings"
	"time"
)

// user demo
var Users = map[string]string{
    "user1@gmail.com": "123",
    "user2@gmail.com": "123",
    "user3@gmail.com": "123",
}

var (
    // secret for token signature (override with AUTH_SECRET env var)
    secret  = func() string { if s := os.Getenv("AUTH_SECRET"); s != "" { return s }; return "dev-secret" }()
    ttl     = 2 * time.Hour // token lifetime
)

// autentikasi cek credentials token
func Authenticate(email, password string) (string, bool) {
    pass, ok := Users[email]
    if !ok || pass != password {
        return "", false
    }
    // buat token: base64(email|ts|hmac)
    ts := strconv.FormatInt(time.Now().UTC().Unix(), 10)
    payload := email + "|" + ts
    sign := hmacHex(payload, secret)
    raw := payload + "|" + sign
    return base64.StdEncoding.EncodeToString([]byte(raw)), true
}

// validasi token
func ValidateToken(token string) (string, bool) {
    b, err := base64.StdEncoding.DecodeString(token)
    if err != nil {
        return "", false
    }
    // pisahkan komponen token
    parts := strings.SplitN(string(b), "|", 3)
    if len(parts) != 3 {
        return "", false
    }
    // validasi signature & ttl
    email, tsStr, sign := parts[0], parts[1], parts[2]
    payload := email + "|" + tsStr
    expected := hmacHex(payload, secret)
    if !hmac.Equal([]byte(sign), []byte(expected)) {
        return "", false
    }
    // validasi ttl
    tsInt, err := strconv.ParseInt(tsStr, 10, 64)
    if err != nil {
        return "", false
    }
    // expired?
    if time.Since(time.Unix(tsInt, 0)) > ttl {
        return "", false
    }
    return email, true
}

// HMAC-SHA256 dalam hex
func hmacHex(message, key string) string {
    h := hmac.New(sha256.New, []byte(key))
    h.Write([]byte(message))
    return hex.EncodeToString(h.Sum(nil))
}