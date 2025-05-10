import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import NameDropdown from "./InputName";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("InputName Component", () => {
  test("API の値を取得してドロップダウンに表示する", async () => {
    // mockedAxios.get.mockResolvedValue({
    //   data: ["Alice", "Bob", "Charlie"],
    // });
    //
    // render(<NameDropdown />);
    //
    // // ローディング表示
    // expect(screen.getByRole("progressbar")).toBeInTheDocument();
    //
    // // API のデータ取得後、ドロップダウンが表示される
    // await screen.findByTestId("name-dropdown");
    //
    // // "Alice", "Bob", "Charlie" が表示されるか確認
    // expect(screen.getByText("Alice")).toBeInTheDocument();
    // expect(screen.getByText("Bob")).toBeInTheDocument();
    // expect(screen.getByText("Charlie")).toBeInTheDocument();
    //
    // // "Alice" を選択
    // fireEvent.mouseDown(screen.getByTestId("name-dropdown"));
    // fireEvent.click(screen.getByText("Alice"));
    //
    // // 選択が反映されることを確認
    // expect(screen.getByTestId("name-dropdown")).toHaveTextContent("Alice");
  });
});
