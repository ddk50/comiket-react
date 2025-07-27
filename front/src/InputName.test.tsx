import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import NameDropdown from "./InputName";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("InputName Component", () => {
  test("API の値を取得してドロップダウンに表示する", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { orderSubmitters: ["Alice", "Bob", "Charlie"] },
    });

    const handleSelect = jest.fn();
    const handleError = jest.fn();

    render(<NameDropdown onSelect={handleSelect} onError={handleError} />);

    // ローディング表示
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // API 取得完了を待つ
    const dropdown = await screen.findByTestId("name-dropdown");

    // "Alice", "Bob", "Charlie" が候補に表示されるか
    fireEvent.mouseDown(dropdown);  // メニュー開く

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    // "Alice" を選択
    fireEvent.click(screen.getByText("Alice"));

    // onSelect が呼ばれたことを確認
    expect(handleSelect).toHaveBeenCalledWith("Alice");
  });
});
