import { createTheme, ThemeProvider, Autocomplete, TextField } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useMemo } from "react";
import { useQueryParams } from "bmat/hooks";

const THEME = createTheme({
    typography: {
        fontSize: 12,
    },
});

export const DashboardVariable = ({
    width,
    variable,
    default_value,
    values,
    style,
    disabled_actions,
    setVariable,
    getVariable,
}: {
    width: number;
    variable: string;
    default_value: string;
    values: string[];
    style: string;
    disabled_actions: boolean;
    setVariable: (name: string, value: any) => void;
    getVariable: (name: string) => string | undefined;
}) => {
    let loaded;
    if (disabled_actions) {
        loaded = true;
    } else {
        loaded = useQueryParams([
            {
                name: `var_${variable}`,
                value: getVariable(variable),
                setter: (value) => setVariable(variable, value),
            },
        ]);
    }
    let current_value: string = useMemo(() => {
        let current_value;
        if (disabled_actions) {
            current_value = default_value;
            if (getVariable(variable) !== current_value) {
                setVariable(variable, current_value);
            }
        } else {
            current_value = getVariable(variable);
            if (current_value === undefined) {
                setVariable(variable, default_value);
                current_value = default_value;
            }
        }
        return current_value;
    }, [getVariable(variable), disabled_actions, default_value, variable, setVariable]);
    if (!loaded) {
        return <></>;
    }
    if (style === "list" || disabled_actions) {
        return (
            <div style={{ width }}>
                <Select
                    className="idc-editor-select"
                    value={current_value}
                    disabled={disabled_actions}
                    onChange={(e) => {
                        setVariable(variable, e.target.value);
                    }}
                >
                    {values?.map((v) => (
                        <MenuItem key={v} value={v}>
                            {v}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        );
    } else if (style === "input") {
        return (
            <div style={{ width }}>
                <ThemeProvider theme={THEME}>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        options={values}
                        disableClearable
                        value={current_value}
                        disabled={disabled_actions}
                        onChange={(_, val) => {
                            setVariable(variable, val);
                        }}
                        renderInput={(params) => (
                            <TextField
                                variant="standard"
                                {...params}
                                InputProps={{
                                    ...params.InputProps,
                                    type: "search",
                                }}
                            />
                        )}
                    />
                </ThemeProvider>
            </div>
        );
    }
};
