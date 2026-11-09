package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	server := http.NewServeMux()

	server.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Hello World")
	})

	log.Fatal(http.ListenAndServe(":8080", server))
}
