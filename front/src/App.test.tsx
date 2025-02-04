import React from "react";
import { render, screen } from "@testing-library/react";
import { ToastContainer } from "react-toastify";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("エラーが発生したらトーストが表示される", async () => {
  render(
    <>
      <App />
      <ToastContainer />
    </>
  );

  // 発注者が空欄のまま処理を実行
  const fileInput = screen.getByLabelText("ファイルを選択"); // inputタグに `aria-label="ファイルを選択"` を付けると良い
  const fakeFile = new File([""], "test.csv", { type: "text/csv" });

  await userEvent.upload(fileInput, fakeFile);

  const errorToast = await screen.findByText("発注者が空欄だよ！お兄ちゃん！");
  expect(errorToast).toBeInTheDocument();
});
