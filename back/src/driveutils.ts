import { google } from 'googleapis';

const fs = require('fs');
const path = require('path');

const KEYFILEPATH = path.join(__dirname, '..', 'key', 'upfgcomiket-key.json');
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
];
// https://drive.google.com/drive/folders/1iUFKPD8Tekmmj5McpiZKUhQjOlBckxSw?usp=share_link
const DRIVE_FOLDER_ID = '1iUFKPD8Tekmmj5McpiZKUhQjOlBckxSw';

export function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  return google.drive({ version: 'v3', auth });
}

export async function uploadSingleFile(): Promise<string> {
  const service = getDriveService();

  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream('files/test.jpg'),
  };

  try {
    const file = await service.files.create({
      requestBody: {
        name: 'photo.jpg',
        parents: [DRIVE_FOLDER_ID],
      },
      media,
      fields: 'id',
    });
    console.log(`File Uploaded: ${file.statusText}`);
    return `File Uploaded: ${file.statusText}`;
  } catch (err) {
    console.error(`Error: ${err}`);
    return `Error: ${err}`;
  }
}

export async function checkExistDir(folderName: string): Promise<Boolean> {
  const service = getDriveService();
  try {
    const res = await service.files.list({
      q: 'mimeType = \'application/vnd.google-apps.folder\'',
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });
    // @ts-ignore
    res.data.files.forEach(async (file) => {
      console.log('Found dir:', file.name, file.id);
    });
    return true;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

export async function deleteAllFiles(): Promise<Boolean> {
  const service = getDriveService();
  try {
    const res = await service.files.list({
      q: `mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });

    // @ts-ignore
    res.data.files.forEach(async (file) => {
      await service.files.delete({
        fileId: `${file.id}`,
      });
      console.log('Found file:', file.name, file.id);
    });
    return true;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

export async function deleteFile(fileName: string): Promise<Boolean> {
  const service = getDriveService();
  try {
    const res = await service.files.list({
      q: 'mimeType != \'application/vnd.google-apps.folder\'',
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });

    // @ts-ignore
    res.data.files.forEach(async (file) => {
      // GoogleDriveは同名のファイルが複数存在しうるのですべて消す
      if (file.name === fileName) {
        await service.files.delete({
          fileId: `${file.id}`,
        });
        console.log('Removed file:', file.name, file.id);
      }
    });
    return true;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}

export async function uploadCSVFile(employeeName: string, prefix: string, postfix: string) {
  const canonicalFileName = `${prefix}__${employeeName}__${postfix}`;

  // 古いファイルは問答無用で上書き
  deleteFile(canonicalFileName);

  uploadSingleFile();
}

export async function createFolderIfNotExist(folderName: string): Promise<string> {
  const service = getDriveService();

  try {
    const file = await service.files.create({
      requestBody: {
        name: folderName,
        parents: [DRIVE_FOLDER_ID],
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    return `Folder ${folderName} is created: ${file.status}`;
  } catch (err) {
    return `Error: ${err}`;
  }
}
