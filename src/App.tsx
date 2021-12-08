import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
    // Do something with the files
    console.log('acceptedFiles:', acceptedFiles);
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
                <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </div>
      </header>
    </div>
  );
}

export default App;
