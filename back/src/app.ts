import express from "express";
import cors from "cors";
import multer from "multer";
import { uploadCSVFile } from "./driveutils";

const app = express();
const port = process.env.PORT || 3000;

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
  multer({ dest: "tmp/" }).fields([
    { name: "listCSVFile", maxCount: 1 },
    { name: "mapCSVFile", maxCount: 1 },
  ]),
  async (req: express.Request, res: express.Response) => {
    try {
      const { orderName } = req.body;

      if (orderName === "") {
        throw new Error("must be specific a orderName");
      }

      // @ts-ignore
      const listCSV = req.files.listCSVFile;
      // @ts-ignore
      const mapCSV = req.files.mapCSVFile;

      if (!(listCSV[0] && mapCSV[0])) {
        throw new Error("must be specific a file");
      }

      console.log(`${listCSV[0].path}`);
      console.log(`${mapCSV[0].path}`);

      await uploadCSVFile(listCSV[0].path, orderName, "リスト", "C104");
      await uploadCSVFile(mapCSV[0].path, orderName, "地図", "C104");

      res.status(200).send({
        message: "file uploaded",
      });
    } catch (err) {
      console.error(`Error!!: ${err}`);
      res.status(400).send({
        message: err,
      });
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
