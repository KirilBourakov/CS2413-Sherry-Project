package main

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

const MAX_TIME int64 = 5 * 60
const uploadDir = "./MEDIA_ROOT"

type Request struct {
	File_uuid string `json:"id"`
	User_id   string `json:"author"`
	Action    string `json:"action"`
	Time      int64  `json:"time"`
}

func (r *Request) UserPath() string {
	return filepath.Join(uploadDir, r.User_id)
}

func (r *Request) FilePath(ext string) string { // TODO: figure out what's happening with extensions
	return filepath.Join(r.UserPath(), r.File_uuid+ext)
}

func RequestFromEncrypted(key string) (Request, error) {
	jsonstr, err := decrypt(key)
	if err != nil {
		return Request{}, err
	}

	var request Request
	err = json.Unmarshal([]byte(jsonstr), &request)
	if err != nil {
		return Request{}, err
	}
	return request, nil
}

type EncryptedRequest struct {
	Key string `json:"key"`
}

func request_timeout(request Request) bool {
	return (request.Time + MAX_TIME) < time.Now().Unix()
}

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

func getFile(w http.ResponseWriter, r *http.Request) {

}

func handleFileUpload(request Request, r *http.Request) (string, error) {
	file, header, err := r.FormFile("file")
	if err != nil {
		return "", err
	}
	defer file.Close()

	fpath := request.FilePath(filepath.Ext(header.Filename))
	err = os.MkdirAll(request.UserPath(), 0655)
	if err != nil {
		return "", err
	}

	output, err := os.Create(fpath)
	if err != nil {
		return "", err
	}
	defer output.Close()

	_, err = io.Copy(output, file)
	if err != nil {
		return "", err
	}
	return fpath, nil
}

func reportUploadSuccess(request Request, retry bool) error {
	client := &http.Client{Timeout: 5 * time.Second}

	request.Time = time.Now().Unix()
	request.Action = "UPLOAD_SUCCESS"

	payload, err := json.Marshal(request)
	if err != nil {
		return err
	}
	encjson, err := encrypt(string(payload))
	if err != nil {
		return err
	}
	json_str, err := json.Marshal(EncryptedRequest{
		Key: encjson,
	})
	if err != nil {
		return err
	}

	url := os.Getenv("BACKEND_URL") + "/storage/file"
	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(json_str))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	if response.StatusCode != 200 {
		if retry {
			return reportUploadSuccess(request, false)
		}
		return errors.New("Failed to confirm upload")
	}
	return nil
}

func postFile(w http.ResponseWriter, r *http.Request) {
	request, err := RequestFromEncrypted(r.FormValue("key"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if request_timeout(request) || request.Action != "POST" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fpath, err := handleFileUpload(request, r)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = reportUploadSuccess(request, true)
	if err != nil {
		_ = os.Remove(fpath)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func deleteFile(w http.ResponseWriter, r *http.Request) {
	request, err := RequestFromEncrypted(r.URL.Query().Get("key"))
	fmt.Printf(request.File_uuid, request.User_id)
	if err != nil {
		fmt.Println("parse error")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if request_timeout(request) || request.Action != "DELETE" {
		fmt.Print("invalid request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	err = os.Remove(request.FilePath(""))
	if err != nil {
		fmt.Println("Failed to delete file", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func main() {
	godotenv.Load(".env.development")

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
		AllowCredentials: false,
	})

	server := cors_options.Handler(mux)
	log.Fatal(http.ListenAndServe(":8080", server))
}
