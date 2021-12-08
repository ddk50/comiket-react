import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CSVLink, CSVDownload } from 'react-csv';

import Papa from 'papaparse';
import Encoding from 'encoding-japanese';

import React from 'react';
import logo from './logo.svg';
import './App.css';


const style = {
  width: 200,
  height: 150,
  border: "1px dotted #888"
};

function App() {
  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader();
    reader.onload = () => {
      const codes = new Uint8Array(reader.result as ArrayBuffer);
      const encoding = Encoding.detect(codes);

      if (encoding !== false) {
        const unicodeString = Encoding.convert(codes, {
          to: 'UNICODE',
          from: encoding,
          type: 'string',
        });

        Papa.parse(unicodeString, {
              header: true,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (results) => {
                console.log(results);
              }
            }
        );
      } else {
        console.log("csvエンコーディングが推測できません")
      }
    }
    reader.readAsArrayBuffer(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App">
      <header className="App-header">
        <div {...getRootProps()} style={style}>
          <input {...getInputProps()} />
          {
            isDragActive ?
                <p>Drop the files here ...</p> :
                <p>CSVファイルをドラッグアンドドロップしてください</p>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
