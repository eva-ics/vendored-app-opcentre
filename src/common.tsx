import { EvaError, ActionResult } from "@eva-ics/webengine";
import { toast } from "react-hot-toast";
import { createTheme } from "@mui/material";
import { Button, styled } from "@mui/material";

export const onEvaError = (err: EvaError) => {
    onError(`error ${err.code} ${err.message}`);
};

export const onSuccess = (message?: string) => {
    toast.success(message || "success");
};

export const onError = (message?: string) => {
    toast.error(message || "error");
};

export const THEME = createTheme({
    typography: {
        fontSize: 12,
    },
});

export const ButtonStyled = styled(Button)({
    borderColor: "gray",
    color: "gray",
    padding: "5px",
    minWidth: "40px",
});

const DASHBOARDS_DIR = "vendored-apps/opcentre/idc/dashboards";

export const DEFAULT_ALARM_SVC = "eva.alarm.default";

export const formatDashboardPath = (s?: string): string => {
    return s ? `${DASHBOARDS_DIR}/${s}.json` : DASHBOARDS_DIR;
};

export const defaultIDCDashboard = () => {
    return {
        viewport: { x: 900, y: 700 },
        scale: 1,
        grid: 20,
        name: "",
        state_updates: [],
        elements: [
            {
                kind: "label",
                params: {
                    text: "Bohemia Automation",
                    font_size: 21,
                    font_bold: true,
                    color: "",
                },
                position: {
                    x: 80,
                    y: 40,
                },
                zindex: 10,
            },
            {
                kind: "image",
                params: {
                    width: 60,
                    update: 0,
                    image: "https://www.bohemia-automation.com/images/bma.svg",
                },
                position: {
                    x: 20,
                    y: 20,
                },
                zindex: 9,
            },
        ],
    };
};

export const onActionSuccess = (result: ActionResult) => {
    let output;
    if (result.out != undefined && result.out != null) {
        output = `\n\noutput: ${result.out}`;
    }
    onSuccess(`action completed: ${result.uuid} ` + (output === undefined ? "" : output));
};

export const onActionFail = (err: EvaError) => {
    onError(`action failed: ${err.code} ${err.message}`);
};
