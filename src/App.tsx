import React from 'react';
import './App.css';

import { useDropzone } from 'react-dropzone';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import Encoding from 'encoding-japanese';

import TextField from "@material-ui/core/TextField";
import { Checkbox } from "@material-ui/core";

const style = {
  width: 200,
  height: 150,
  border: "1px dotted #888"
};

const radioColors = [
    //{num: 0, code: "#ffffff", label: "全部", checked: true},
    {num: 1, code: "#ff944a", label: "オレンジ"},
    {num: 2, code: "#ff00ff", label: "ピンク"},
    {num: 3, code: "#fff700", label: "黄"},
    {num: 4, code: "#00b54a", label: "緑"},
    {num: 5, code: "#00b5ff", label: "水"},
    {num: 6, code: "#9c529c", label: "紫"},
    {num: 7, code: "#0000ff", label: "青"},
    {num: 8, code: "#00ff00", label: "黄緑"},
    {num: 9, code: "#ff0000", label: "赤"}
];

const App = () => {
  const [result, setResult] = React.useState([[""]]);
  const [summary, setSummary] = React.useState([0]);
  const [orderName, setOrderName] = React.useState("");
  const [checkedColors, _] = React.useState(() => new Set<number>(radioColors.map(e => e.num)) );

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
                          const color = parseInt(row[2]);
                          if (isColorIncluded(color)) {
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
                  }

                  if (result_csv_tmp.length <= 0) {
                      alert("該当するサークルはゼロです。選択した”色”は正しいですか？");
                      return;
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

  const isColorIncluded = (num: number): boolean => {
      return checkedColors.has(num);
  }

  const checkButtonHandler = (num: number) => {
      setSummary([0]);
      if (checkedColors.has(num)) {
          checkedColors.delete(num);
      } else {
          checkedColors.add(num);
      }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const checkGroup = radioColors.map(i =>
      <Checkbox
          defaultChecked
          key={i.num.toString()}
          style = {{
              color: i.code
          }}
          onChange={() => checkButtonHandler(i.num)}
      />
  );

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
            <div>
                <TextField
                    required
                    type="text"
                    id="orderName"
                    placeholder="発注者名"
                    onChange={changeOrderName}
                    variant="outlined"
                />
            </div>
            <div>
                <div>
                    { checkGroup }
                </div>
            </div>
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
