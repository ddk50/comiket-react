import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import axios from "axios";
import Fuse from "fuse.js";
import { toRomaji } from "wanakana";
import {toast} from "react-toastify";

const apiURL = process.env.REACT_APP_COMIKET_API_URL || "http://localhost:3000/order-submitters";

const NameDropdown = ({ onSelect, onError }: { onSelect: (value: string) => void, onError: () => void }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<{ orderSubmitters: string[] }>(apiURL)
        .then((response) => {
          setOptions(response.data.orderSubmitters);
          setLoading(false);
        })
        .catch((error) => {
          toast.error("サーバエラー。発注者一覧がスプレッドシートからとれないの。なにかおかしなことが起こっているどいてそいつころ、管理者に連絡してね！", {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,         // クリックしても閉じない
            closeButton: false,          // 閉じるボタン非表示
            hideProgressBar: true,       // プログレスバー非表示（任意）
            pauseOnHover: false,         // ホバーしても止まらない
            draggable: false,            // ドラッグ無効
            theme: "colored",
          });
          console.error("Error fetching names:", error);
          onError(); // 親に通知
          setLoading(false);
        });
  }, []);

  // Fuse.js 準備
  const fuse = new Fuse(options, { threshold: 0.5 });

  // filterOptions を Fuse.js で上書き
  const filterOptions = (options: string[], { inputValue }: { inputValue: string }) => {
    if (!inputValue) return options;

    const searchRomaji = toRomaji(inputValue).toLowerCase();
    const romajiResults = fuse.search(searchRomaji);
    const originalResults = fuse.search(inputValue);

    const combined = Array.from(
        new Set([...romajiResults.map(r => r.item), ...originalResults.map(r => r.item)])
    );

    return combined;
  };

  return (
      <Autocomplete
          freeSolo
          options={options}
          loading={loading}
          filterOptions={filterOptions}
          onChange={(_, value) => onSelect(value || "")}
          renderInput={(params) => (
              <TextField
                  {...params}
                  label="登録済みのお名前を検索"
                  placeholder="例: おーた"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                    ),
                  }}
              />
          )}
      />
  );
};

export default NameDropdown;
