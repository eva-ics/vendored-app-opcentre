import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

export const EditString = ({
  element_id,
  update_key,
  current_value = "",
  width,
  setParam
}: {
  element_id: string;
  update_key?: any;
  width?: number;
  current_value: string;
  setParam: (a: string) => void;
  params?: { size?: number };
}): JSX.Element => {
  const [input_value, setInputValue] = useState(current_value);

  useEffect(() => {
    setInputValue(current_value);
  }, [element_id, update_key]);

  return (
    <>
      <TextField
        sx={{ padding: "8px", width: width }}
        fullWidth
        type="text"
        value={input_value}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          setParam(val);
        }}
      />
    </>
  );
};
