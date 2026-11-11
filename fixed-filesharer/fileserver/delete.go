package main

import (
	"fmt"
	"net/http"
	"os"
)

func deleteFile(w http.ResponseWriter, r *http.Request) {
	request, err := RequestFromEncrypted(r.URL.Query().Get("key"))
	if err != nil {
		fmt.Println("parse error")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if request.RequestTimeout() || request.Action != "DELETE" {
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
