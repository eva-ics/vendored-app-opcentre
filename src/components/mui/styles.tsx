import { Button, styled } from "@mui/material";

//mui styles
export const ButtonProfile = styled(Button)({
    color: "#a5a6a8",
    borderColor: "#a5a6a8",

    "&:hover": {
        color: "white",
        borderColor: "white",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    "&.Mui-disabled": {
        color: "#515050",
        borderColor: "#515050",
    },
});
