import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import App from "./App";

const sampleCSVFile = new File(
  [
    "Header,ComicMarketCD-ROMCatalog,ComicMarket105" +
      "\n" +
      'Circle,103164,1,87,33,土,東,Ａ,16,500,"帰宅時間","キタクジカン","きたく","","https://twitter.com/ktk_er18","","百合と成人向け","",,,"",0,"","","",""',
  ],
  "test.csv",
  { type: "text/csv" }
);

jest.mock("axios");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("App Component", () => {
  test("発注者名が未入力でエラーになること", async () => {
    render(<App />);

    // 発注者未入力

    const fileInput = screen.getByTestId("csv-fileinput");
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });

    await userEvent.upload(fileInput, file);

    await screen.findByText(/発注者が空欄/); // エラーメッセージが出るか確認
  });

  test("チェックボックスの状態変更ができること", async () => {
    render(<App />);

    const checkbox = screen.getAllByRole("checkbox")[0];

    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  test("API にデータ送信する際のリクエストが正しいこと", async () => {
    render(<App />);

    // 発注者
    const orderNameInput = screen.getByPlaceholderText("発注者名");
    await userEvent.type(orderNameInput, "東村光");

    const fileInput = screen.getByTestId("csv-fileinput");
    await userEvent.upload(fileInput, sampleCSVFile);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/upload"),
        expect.any(FormData)
      )
    );
  });

  test("成功した場合にトーストが表示されること", async () => {
    jest.spyOn(axios, "post").mockResolvedValue({ status: 200 });

    render(<App />);

    // 発注者
    const orderNameInput = screen.getByPlaceholderText("発注者名");
    await userEvent.type(orderNameInput, "東村光");

    const fileInput = screen.getByTestId("csv-fileinput");

    await userEvent.upload(fileInput, sampleCSVFile);

    await screen.findByText(/件のサークルを提出しました/); // メッセージが出るか確認
  });
});
