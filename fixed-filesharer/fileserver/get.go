package main

import (
	"fmt"
	"net/http"
)

func getFile(w http.ResponseWriter, r *http.Request) {
	request, err := RequestFromEncrypted(r.URL.Query().Get("key"))
	if err != nil {
		fmt.Println("parse error")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if request.RequestTimeout() || request.Action != "GET" {
		fmt.Print("invalid request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%q", request.FileName)) // TODO: keep file name on download?
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Type", request.MimeFileType())

	http.ServeFile(w, r, request.FilePath())
}
