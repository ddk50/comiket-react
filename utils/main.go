package main

import (
	"bufio"
	"fmt"
	"github.com/lxn/win"
	"io"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"syscall"
)

var re = regexp.MustCompile(`Header,ComicMarketCD-ROMCatalog,ComicMarket\d+,UTF-8,Web 1\.\d+\.1`)
var newHeader = "Header,ComicMarketCD-ROMCatalog,ComicMarket104,UTF-8,Web 1.101.1"

func UTF16PtrFromString(s string) *uint16 {
	result, _ := syscall.UTF16PtrFromString(s)
	return result
}

func messageBox(msg string) bool {
	ret := win.MessageBox(
		win.HWND(0),
		UTF16PtrFromString(msg),
		UTF16PtrFromString("タイトル"),
		win.MB_OKCANCEL,
	)

	switch ret {
	case win.IDOK:
		return true
	}
	return false
}

func messagePanic(msg string) {
	win.MessageBox(
		win.HWND(0),
		UTF16PtrFromString(msg),
		UTF16PtrFromString("タイトル"),
		win.MB_OK,
	)
	os.Exit(1)
}

func replaceHead(r io.Reader, w io.Writer) error {
	sc := bufio.NewScanner(r)
	first := true

	for sc.Scan() {
		line := sc.Text()
		if first {
			line = newHeader
		}
		if _, err := io.WriteString(w, line+"\n"); err != nil {
			return err
		}
		first = false
	}
	return sc.Err()
}

func concatCSV(acc io.Writer, r io.Reader) error {
	sc := bufio.NewScanner(r)
	first := true

	for sc.Scan() {
		// ヘッダーがあるはずなので最初のラインは無視する
		if !first {
			line := sc.Text()
			if _, err := io.WriteString(acc, line+"\n"); err != nil {
				return err
			}
		}
		first = false
	}

	return sc.Err()
}

func main() {
	targetDir, err := os.Getwd()
	if err != nil {
		messagePanic(fmt.Sprintf("%v", err))
	}

	pattern := path.Join(targetDir, "*.csv")
	files, err := filepath.Glob(pattern)
	if err != nil {
		messagePanic(fmt.Sprintf("%v", err))
	}

	var targetFiles []string
	for _, path := range files {
		f, err := os.Open(path)
		if err != nil {
			messagePanic(fmt.Sprintf("%v", err))
		}

		fileScanner := bufio.NewScanner(f)

		if fileScanner.Scan() {
			if re.MatchString(fileScanner.Text()) {
				targetFiles = append(targetFiles, path)
			}
		}

		if err := f.Close(); err != nil {
			messagePanic(fmt.Sprintf("%v", err))
		}
	}

	if len(targetFiles) == 0 {
		messagePanic(fmt.Sprintf("変換対象となるファイルがありません"))
	}

	tmpFileDir := targetDir
	successCount := 0

	ret := messageBox(fmt.Sprintf("変換対象のcsvファイル: %d 個\nよろしいですか？", len(targetFiles)))
	if ret {
		// 最初に結合済みcsvファイルを用意する
		accFile, err := os.Create("all.csv")
		if err != nil {
			messagePanic(fmt.Sprintf("結合csvファイルのオープンに失敗しました: %v", err))
		}

		// 最初にヘッダーを一つ書き込む
		accWriter := bufio.NewWriter(accFile)
		if _, err := io.WriteString(accWriter, newHeader+"\n"); err != nil {
			messagePanic(fmt.Sprintf("結合csvファイルへのヘッダー書き込みに失敗: %v", err))
		}

		for _, path := range targetFiles {
			src, err := os.Open(path)
			if err != nil {
				messagePanic(fmt.Sprintf("%v", err))
			}

			// まず結合csvに書き込む
			if err := concatCSV(accWriter, src); err != nil {
				messagePanic(fmt.Sprintf("結合csvファイルへの書き込みに失敗: %v", err))
			}

			// concatCSVで進んだのでSeekで元に戻す
			src.Seek(0, 0)

			// 次に変換プロセス
			tmp, err := ioutil.TempFile(tmpFileDir, "replace-*")
			if err != nil {
				messagePanic(fmt.Sprintf("一時ファイルの作成に失敗: %v", err))
			}

			if err := replaceHead(src, tmp); err != nil {
				messagePanic(fmt.Sprintf("%v", err))
			}

			// 後片付け
			if err := tmp.Close(); err != nil {
				messagePanic(fmt.Sprintf("%v", err))
			}

			if err := src.Close(); err != nil {
				messagePanic(fmt.Sprintf("%v", err))
			}

			if err := os.Rename(tmp.Name(), path); err != nil {
				messagePanic(fmt.Sprintf("%v", err))
			}

			successCount += 1
		}
	}
	messagePanic(fmt.Sprintf("%d 個のファイルを変換しました", successCount))
}
