# Based off of https://docs.docker.com/guides/golang/

FROM golang:1.27

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /run-server

EXPOSE 8080

CMD ["/run-server"]