import express from "express";
import cors from "cors";
import multer from "multer";
import { uploadCSVFile } from "./driveutils";

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

app.get("/", (req: express.Request, res: express.Response) => {
  const msg = createMessage("Hello World!");
  res.send(msg.message);
});

app.post(
  "/upload",
  multer({ dest: "tmp/" }).single("file"),
  (req: express.Request, res: express.Response) => {
    const { filename } = req.body;

    if (!req.file) {
      res.status(400).send({
        message: "must be specific a file",
      });
      return;
    }

    try {
      uploadCSVFile(req.file.path, "たかはし", "C101", "生協");
      res.status(200).send({
        message: "file uploaded",
      });
    } catch (err) {
      res.status(400).send({
        message: err,
      });
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
