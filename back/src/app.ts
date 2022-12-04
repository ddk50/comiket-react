import express from 'express';
import cors from 'cors';
import {
  checkExistDir,
  checkExistFile,
  createFolderIfNotExist, deleteAllDirs, deleteAllFiles,
  uploadSingleFile
} from './driveutils';

const app = express();
const port = 3000;

app.use(cors());
interface MyResponse {
    message: string;
}
function createMessage(myMessage: string): MyResponse {
  const myResponse = {
    message: myMessage,
  };
  return myResponse;
}
app.get('/', (req: express.Request, res: express.Response) => {
  const msg = createMessage('Hello World!');
  res.send(msg.message);
});

app.get('/upload', (req: express.Request, res: express.Response) => {
  uploadSingleFile().then((msg: string) => {
    res.send({
      message: msg,
    });
  });
});

function csvExists(employeeName: string, eventName: string) {

}

app.get('/checkFile', (req: express.Request, res: express.Response) => {
  checkExistFile('高橋一志', '1iUFKPD8Tekmmj5McpiZKUhQjOlBckxSw').then(() => {
    res.send({
      message: 'ok',
    });
  });
});

app.get('/checkDir', (req: express.Request, res: express.Response) => {
  checkExistDir('高橋一志').then(() => {
    res.send({
      message: 'ok',
    });
  });
});

app.get('/deleteAllFiles', (req: express.Request, res: express.Response) => {
  deleteAllFiles().then(() => {
    res.send({
      message: 'ok',
    });
  });
});

// app.get('/deleteAllDirs', (req: express.Request, res: express.Response) => {
//   deleteAllDirs().then(() => {
//     res.send({
//       message: 'ok',
//     });
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
