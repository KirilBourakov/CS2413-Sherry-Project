package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

const uploadDir = "./MEDIA_ROOT"

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
