FROM golang:1.25-alpine AS builder
WORKDIR /src

# Install git untuk download dependencies
RUN apk add --no-cache git

# copy module files dari root lalu download deps
COPY go.mod go.sum ./
RUN go mod download

# copy seluruh repo lalu build target backend/chain
COPY . .
WORKDIR /src/backend/chain
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/chain ./main.go

# Build CometBFT
WORKDIR /tmp
RUN git clone https://github.com/cometbft/cometbft.git --branch v0.38.0 --depth 1
WORKDIR /tmp/cometbft
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/cometbft ./cmd/cometbft

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/chain /usr/local/bin/chain
COPY --from=builder /bin/cometbft /usr/local/bin/cometbft
EXPOSE 26658
ENTRYPOINT ["/usr/local/bin/chain"]