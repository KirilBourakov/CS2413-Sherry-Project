package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	svg "github.com/h2non/go-is-svg"
	svgsanitize "go.privatebychoice.com/pbcsvgsanitize"
)

const MaxFileSize = 20 << 20

func sanitize(fileBytes []byte) ([]byte, error) {
	if svg.Is(fileBytes) {
		clean, _, err := svgsanitize.Sanitize(fileBytes)
		if err != nil {
			return nil, err
		}
		fileBytes = clean
	}
	return fileBytes, nil
}

func handleFileUpload(request Request, r *http.Request) (string, error) {
	err := r.ParseMultipartForm(MaxFileSize)
	if err != nil {
		return "", err
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		return "", err
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	fileBytes, err = sanitize(fileBytes)
	if err != nil {
		return "", err
	}

	fpath := request.FilePath()
	err = os.MkdirAll(request.UserPath(), 0755)
	if err != nil {
		return "", err
	}

	output, err := os.Create(fpath)
	if err != nil {
		return "", err
	}
	defer output.Close()

	_, err = output.Write(fileBytes)

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

	if request.RequestTimeout() || request.Action != "POST" {
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
