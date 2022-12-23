# for development purposes
version=0.1
run:
	go build -o csv && ./csv
test:
	go test -v ./...
build_self_arch:
	go build -ldflags "-X db_server/platform/util.Version=$(version)" -o dist/csv
build_win:
	GOOS=windows GOARCH=amd64 CGO_ENABLED=1 CXX=x86_64-w64-mingw32-g++ CC=x86_64-w64-mingw32-gcc go build -ldflags "-X db_server/platform/util.Version=$(version) -H windowsgui" -o dist/csv.exe
