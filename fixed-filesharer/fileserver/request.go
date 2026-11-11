package main

import (
	"encoding/json"
	"path/filepath"
	"time"
)

const MAX_TIME int64 = 5 * 60

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
