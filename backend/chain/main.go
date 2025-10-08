// entry point blockchain ABCI server
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	abciserver "github.com/cometbft/cometbft/abci/server"
	"evote/backend/chain/app" 
)

func main() {
	a := app.NewApp()

	// jalanin server ABCI
	srv, err := abciserver.NewServer("tcp://0.0.0.0:26658", "socket", a)
	if err != nil { log.Fatal(err) }
	if err := srv.Start(); err != nil { log.Fatal(err) }
	log.Println("ABCI listening on tcp://0.0.0.0:26658")

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c
	_ = srv.Stop()
}
