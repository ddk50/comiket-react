import { useDropzone } from 'react-dropzone';
import { CSVLink } from 'react-csv';

import Papa from 'papaparse';
import Encoding from 'encoding-japanese';

import React from 'react';
import './App.css';


const style = {
  width: 200,
  height: 150,
  border: "1px dotted #888"
};

const App = () => {
  const [result, setResult] = React.useState([[""]]);
  const [summary, setSummary] = React.useState([0]);
  const [orderName, setOrderName] = React.useState("");

  const reader = new FileReader();

  const changeOrderName = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setOrderName(value);
  };

  reader.onloadend = (event) => {
      if (orderName === "") {
          alert("発注者が空欄です");
          return;
      }

      const codes = new Uint8Array(reader.result as ArrayBuffer);
      const encoding = Encoding.detect(codes);

      if (encoding !== false) {
          const unicodeString = Encoding.convert(codes, {
              to: 'UNICODE',
              from: encoding,
              type: 'string',
          });

          Papa.parse(unicodeString, {
              header: false,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (results) => {
                  const header = results.data[0] as Array<string>
                  if (header[0] !== 'Header' || header[1] !== 'ComicMarketCD-ROMCatalog' || header[2] !== 'ComicMarket99') {
                      alert("このファイルはC99のWebカタログのcsvではありません");
                      return;
                  }

                  const body = results.data.slice(1);
                  const result_csv_tmp: Array<Array<string>> = []

                  for (var row of body as Array<string>) {
                      if (row[0] === "Circle") {
                          const week = row[5];
                          const house = row[6];
                          const section = row[7];
                          const number = String(row[8]).padStart(2, '0');
                          const ab = row[21].toString() === "0" ? "a" : "b";
                          const circle_name = row[10];
                          const order_name = orderName

                          const format_str = `${house}${section}${number}${ab}`;
                          result_csv_tmp.push([week, format_str, circle_name, "新刊", "", order_name]);
                      }
                  }

                  setResult(result_csv_tmp);
                  setSummary([result_csv_tmp.length]);
              }
          });
      } else {
          alert("csvエンコーディングが推測できません。不明なエンコード");
          return;
      }
  };

  const onDrop = (acceptedFiles: File[]) => {
      reader.readAsArrayBuffer(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App">
        <div className="Msg">
            {
                summary[0] === 0 ?
                    <p>WebカタログのCSVをアップロードして変換してください</p> :
                    <div>
                        <p>{summary[0]}件のサークルを変換しました</p>
                        <CSVLink data={result}>CSVをダウンロードしてください</CSVLink>
                    </div>
            }
        </div>
        <div>
            <input type="text" id="orderName" placeholder="発注者名" onChange={changeOrderName}/>
        </div>
        <header className="App-header">
            <div {...getRootProps()} style={style}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>ファイルをここに ...</p> :
                        <p>ドラッグアンドドロップしてください</p>
                }
            </div>
        </header>
    </div>
  );
}

export default App;
