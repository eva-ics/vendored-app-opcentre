import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { THEME } from "../../common";
import { Autocomplete, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";

export const EditSelectOID = ({
  current_value = "",
  setParam,
  params
}: {
  current_value: string;
  setParam: (a: string) => void;
  params?: { i?: Array<string> | string; src?: string };
}): JSX.Element => {
  const eva = get_engine() as Eva;

  const [oid_list, setOIDList] = useState<Array<string>>([]);

  useEffect(() => {
    eva.call("item.state", { i: params?.i }).then((items) => {
      setOIDList(items.map((item: any) => item.oid));
    });
  }, [params]);

  return (
    <ThemeProvider theme={THEME}>
      <Autocomplete
        fullWidth
        freeSolo
        options={oid_list}
        disableClearable
        value={current_value || ""}
        onChange={(_, val) => {
          setParam(val);
        }}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            InputProps={{
              ...params.InputProps,
              type: "search"
            }}
          />
        )}
      />
    </ThemeProvider>
  );
};
