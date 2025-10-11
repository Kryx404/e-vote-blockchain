FROM golang:1.25-alpine AS builder
WORKDIR /src

# copy module files dari root lalu download deps
COPY go.mod go.sum ./
RUN go mod download

# copy seluruh repo lalu build target backend/api
COPY . .
WORKDIR /src/backend/api

# build hanya paket main di folder ini (ganti '.' jika main ada di subfolder lain)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/backend .

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/backend /usr/local/bin/backend
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/backend"]