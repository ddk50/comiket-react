import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

// サービスアカウントキーのパス
const KEYFILEPATH = path.join(__dirname, "..", "key", "upfgcomiket-key.json");

export async function getOrderSubmittersFromSheet(
  spreadsheetId: string,
  sheetName: string
): Promise<string[]> {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });

  const range = `${sheetName}!B:B`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const values = res.data.values ?? [];

  return values.map((row) => row[0]);
}
