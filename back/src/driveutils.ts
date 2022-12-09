import { google } from "googleapis";

const fs = require("fs");
const path = require("path");

const KEYFILEPATH = path.join(__dirname, "..", "key", "upfgcomiket-key.json");
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file",
];
// https://drive.google.com/drive/folders/1iUFKPD8Tekmmj5McpiZKUhQjOlBckxSw?usp=share_link
const DRIVE_FOLDER_ID = "1iUFKPD8Tekmmj5McpiZKUhQjOlBckxSw";

export function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

async function uploadSingleFile(
  localFilePath: string,
  labelName: string,
  mimeType: string = "text/csv"
): Promise<string> {
  const service = getDriveService();

  const media = {
    mimeType,
    body: fs.createReadStream(localFilePath),
  };

  const file = await service.files.create({
    requestBody: {
      name: labelName,
      parents: [DRIVE_FOLDER_ID],
    },
    media,
    fields: "id",
  });
  console.log(`File Uploaded: ${file.statusText}`);
  return `File Uploaded: ${file.statusText}`;
}

async function deleteAllFile(fileName: string): Promise<Boolean> {
  const service = getDriveService();
  const res = await service.files.list({
    q: "mimeType != 'application/vnd.google-apps.folder'",
    fields: "nextPageToken, files(id, name)",
    spaces: "drive",
  });

  if (res.data.files) {
    res.data.files.forEach(async (file) => {
      // GoogleDriveは同名のファイルが複数存在しうるのですべて消す
      if (file.name === fileName) {
        await service.files.delete({
          fileId: `${file.id}`,
        });
        console.log("Removed file:", file.name, file.id);
      }
    });
  }
  return true;
}

export async function uploadCSVFile(
  localFilePath: string,
  employeeName: string,
  prefix: string,
  postfix: string,
  mimeType: string = "text/csv"
) {
  const canonicalFileName = `${prefix}__${employeeName}__${postfix}`;

  // 全部消す
  await deleteAllFile(canonicalFileName);
  await uploadSingleFile(localFilePath, canonicalFileName, mimeType);
}
