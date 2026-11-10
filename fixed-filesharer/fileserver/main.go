package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func decrypt(cyphertext string) (string, error) {
	decoded, _ := base64.StdEncoding.DecodeString(cyphertext)

	keystr, _ := hex.DecodeString(os.Getenv("FILE_KEY"))
	key, _ := aes.NewCipher(keystr)
	aesgcm, _ := cipher.NewGCM(key)

	plaintext, _ := aesgcm.Open(nil, decoded[:12], decoded[12:], nil)
	fmt.Printf("Decrypted Plaintext = %s\n", plaintext)
	return string(plaintext), nil
}

func encrypt(plaintext string) (string, error) {
	keystr, _ := hex.DecodeString(os.Getenv("FILE_KEY"))
	key, _ := aes.NewCipher(keystr)
	aesgcm, _ := cipher.NewGCM(key)

	nonce := make([]byte, aesgcm.NonceSize())
	io.ReadFull(rand.Reader, nonce)

	ciphertext := aesgcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func getFile(w http.ResponseWriter, r *http.Request) {

}

func postFile(w http.ResponseWriter, r *http.Request) {

}

func deleteFile(w http.ResponseWriter, r *http.Request) {

}

func main() {
	godotenv.Load(".env.dev")

	mux := http.NewServeMux()

	mux.HandleFunc("/storage/file", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			getFile(w, r)
		case "POST":
			postFile(w, r)
		case "DELETE":
			deleteFile(w, r)
		default:
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		}
	})

	cors_options := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:8000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	server := cors_options.Handler(mux)
	log.Fatal(http.ListenAndServe(":8080", server))
}
