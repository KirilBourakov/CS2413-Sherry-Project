package main

import (
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
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
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%q", request.File_uuid)) // TODO: keep file name on download?
	w.Header().Set("X-Content-Type-Options", "nosniff")

	contentType := mime.TypeByExtension(filepath.Ext(request.File_uuid))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)
	
	http.ServeFile(w, r, request.FilePath(""))
}
