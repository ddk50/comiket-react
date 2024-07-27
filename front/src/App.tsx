import React, { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { useDropzone } from "react-dropzone";
import axios from "axios";
import Papa from "papaparse";
import Encoding from "encoding-japanese";
import { toast, ToastContainer } from "react-toastify";

import TextField from "@material-ui/core/TextField";
import { Checkbox } from "@material-ui/core";
import { isSafari, toCSV } from "./libs/csv";

const style = {
  width: 200,
  height: 150,
  border: "1px dotted #888",
};

const apiURL =
  process.env.REACT_APP_COMIKET_API_URL || "http://localhost:3000/upload";

const radioColors = [
  // {num: 0, code: "#ffffff", label: "全部", checked: true},
  { num: 1, code: "#ff944a", label: "オレンジ" },
  { num: 2, code: "#ff00ff", label: "ピンク" },
  { num: 3, code: "#fff700", label: "黄" },
  { num: 4, code: "#00b54a", label: "緑" },
  { num: 5, code: "#00b5ff", label: "水" },
  { num: 6, code: "#9c529c", label: "紫" },
  { num: 7, code: "#0000ff", label: "青" },
  { num: 8, code: "#00ff00", label: "黄緑" },
  { num: 9, code: "#ff0000", label: "赤" },
];

const integrateColorNumber = "1";

function makeCSVBlobFromArrays(
  csvArray: Array<Array<string>>,
  header: Array<string> = [],
  headerWithoutEnclosingChar: Boolean = false
): Blob {
  const separator = ",";
  const uFEFF = true;
  const enclosingCharacter = '"';

  const innerHeader = header.length === 0 ? null : header;

  const csv = toCSV(
    csvArray,
    innerHeader,
    separator,
    enclosingCharacter,
    headerWithoutEnclosingChar
  );
  const type = isSafari() ? "application/csv" : "text/csv";
  const blob = new Blob([uFEFF ? "\uFEFF" : "", csv], { type });

  return blob;
}

function makeCSVFormData(
  csvListData: Array<Array<string>>,
  csvListHeader: Array<string>,
  csvMapData: Array<Array<string>>,
  csvMapHeader: Array<string>,
  orderName: string
): FormData {
  const listCSVBlob = makeCSVBlobFromArrays(csvListData, csvListHeader);

  // mapCSVのほうはヘッダーにダブルクオーテーションをつけてはいけない（コミケソフトで読めなくなる）
  const mapCSVBlob = makeCSVBlobFromArrays(csvMapData, csvMapHeader, true);

  const formData = new FormData();
  formData.append("listCSVFile", new File([listCSVBlob], "list.csv"));
  formData.append("mapCSVFile", new File([mapCSVBlob], "map.csv"));
  formData.append("orderName", orderName);

  return formData;
}

function changeRowColor(
  row: Array<string>,
  changeColor = integrateColorNumber
): Array<string> {
  return row.map((col: string, index: number) => {
    return index === 2 ? changeColor : col;
  });
}

function App() {
  const [toastMessage, setToastMessage] = React.useState(["info", ""]);
  const [toastId, setToastId] = React.useState<any>(undefined);
  const [orderName, setOrderName] = React.useState("");
  const [checkedColors, _] = React.useState(
    () => new Set<number>(radioColors.map((e) => e.num))
  );

  const reader = new FileReader();

  const changeOrderName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setOrderName(value);
  };

  const isColorIncluded = (num: number): boolean => checkedColors.has(num);

  React.useEffect(() => {
    if (!toastId) {
      if (toastMessage[1] !== "") {
        setToastId(
          toast.loading(toastMessage[1], {
            position: "top-center",
          })
        );
      }
    } else {
      switch (toastMessage[0]) {
        case "start": {
          toast.loading(toastMessage[1], {
            position: "top-center",
          });
          break;
        }
        case "info": {
          toast.update(toastId, {
            render: toastMessage[1],
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            isLoading: false,
            theme: "light",
          });
          break;
        }
        case "success": {
          toast.update(toastId, {
            render: toastMessage[1],
            type: "success",
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            isLoading: false,
            theme: "colored",
          });
          break;
        }
        case "error": {
          toast.update(toastId, {
            render: toastMessage[1],
            type: "error",
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            isLoading: false,
            theme: "colored",
          });
          break;
        }
        default: {
          toast.error(toastMessage[1], {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            isLoading: false,
            theme: "colored",
          });
          break;
        }
      }
    }
  }, [toastMessage]);

  reader.onloadend = (_event) => {
    try {
      setToastMessage(["start", "変換開始"]);

      if (orderName === "") {
        throw new Error("発注者が空欄だよ！お兄ちゃん！");
      }

      const codes = new Uint8Array(reader.result as ArrayBuffer);
      const encoding = Encoding.detect(codes);

      if (encoding === false) {
        throw new Error(
          "csvエンコーディングが推測できないよ！不明なエンコードだよお兄ちゃん！"
        );
      }

      const unicodeString = Encoding.convert(codes, {
        to: "UNICODE",
        from: encoding,
        type: "string",
      });

      Papa.parse(unicodeString, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const header = results.data[0] as Array<string>;
          if (
            header[0] !== "Header" ||
            header[1] !== "ComicMarketCD-ROMCatalog" ||
            header[2] !== "ComicMarket104"
          ) {
            throw new Error(
              "このファイルはC104のWebカタログのcsvじゃないみたいだよ！お兄ちゃん！"
            );
          }

          const body = results.data.slice(1);
          const result_csv_list: Array<Array<string>> = [];
          const result_csv_map: Array<Array<string>> = [];

          // eslint-disable-next-line no-restricted-syntax
          for (const row of body as Array<Array<string>>) {
            if (row[0] === "Circle") {
              const color = parseInt(row[2], 10);
              if (isColorIncluded(color)) {
                const week = row[5];
                const house = row[6];
                const section = row[7];
                const number = String(row[8]).padStart(2, "0");
                const ab = row[21].toString() === "0" ? "a" : "b";
                const circle_name = row[10];
                const order_name = orderName;

                // 色の名前を探す
                const val = radioColors.find((hash) => hash.num === color);
                if (val === undefined) {
                  throw new Error(
                    `不明な色コードが存在します: ${color},${row}`
                  );
                }

                const color_name = val.label.toString();

                result_csv_map.push(changeRowColor(row));

                const format_str = `${house}${section}${number}${ab}`;
                result_csv_list.push([
                  week,
                  format_str,
                  circle_name,
                  "",
                  order_name,
                  color_name,
                ]);
              }
            }
          }

          if (result_csv_list.length <= 0) {
            throw new Error(
              "発注数はゼロだけど大丈夫？”色”をちゃんと選択してる？"
            );
          }

          const params = makeCSVFormData(
            result_csv_list,
            [],
            result_csv_map,
            header,
            orderName
          );

          axios
            .post(apiURL, params)
            .then(() => {
              setToastMessage([
                "success",
                `${result_csv_list.length} 件のサークルを提出しました。お疲れ様ですお兄ちゃん！`,
              ]);
              setToastId(undefined);
            })
            .catch((err) => {
              setToastMessage(["error", `${err}`]);
              setToastId(undefined);
            });
        },
      });
    } catch (err) {
      setToastMessage(["error", `${err}`]);
      setToastId(undefined);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    reader.readAsArrayBuffer(acceptedFiles[0]);
  };

  const checkButtonHandler = (num: number) => {
    if (checkedColors.has(num)) {
      checkedColors.delete(num);
    } else {
      checkedColors.add(num);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const checkGroup = radioColors.map((i) => (
    <Checkbox
      defaultChecked
      key={i.num.toString()}
      style={{
        color: i.code,
      }}
      onChange={() => checkButtonHandler(i.num)}
    />
  ));

  return (
    <div className="App">
      <div className="Msg">
        <div>
          <ToastContainer />
        </div>
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
          <div>{checkGroup}</div>
        </div>
      </div>
      <header className="App-header">
        <div {...getRootProps()} style={style}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>ファイルをここに ...</p>
          ) : (
            <p>ドラッグアンドドロップしてください</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
