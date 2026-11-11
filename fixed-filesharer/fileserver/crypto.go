package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

func decrypt(cyphertext string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(cyphertext)
	if err != nil {
		return "1", err
	}

	keystr, err := hex.DecodeString(os.Getenv("FILE_KEY"))
	if err != nil {
		return "2", err
	}
	key, err := aes.NewCipher(keystr)
	if err != nil {
		return "3", err
	}
	aesgcm, err := cipher.NewGCM(key)
	if err != nil {
		return "4", err
	}

	plaintext, err := aesgcm.Open(nil, decoded[:12], decoded[12:], nil)
	if err != nil {
		return "5", err
	}
	fmt.Println(string(plaintext))
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
