package main

import (
	"encoding/json"
	"mime"
	"path/filepath"
	"strconv"
	"time"
)

const MAX_TIME int64 = 5 * 60

type Request struct {
	FileUuid string `json:"file_uuid"`
	FileName string `json:"file_name"`
	UserId   int64  `json:"user_id"`
	Action   string `json:"action"`
	Time     int64  `json:"time"`
}

func (r *Request) UserPath() string {
	return filepath.Join(uploadDir, strconv.FormatInt(r.UserId, 10))
}

func (r *Request) FilePath() string { // TODO: figure out what's happening with extensions
	return filepath.Join(r.UserPath(), r.FileUuid+filepath.Ext(r.FileName))
}

func (r *Request) MimeFileType() string {
	contentType := mime.TypeByExtension(filepath.Ext(r.FilePath()))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	return contentType
}

func (r *Request) RequestTimeout() bool {
	return (r.Time + MAX_TIME) < time.Now().Unix()
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
