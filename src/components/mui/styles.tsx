import { Button, styled } from "@mui/material";

//mui styles
export const ButtonProfile = styled(Button)({
    color: "gray",
    borderColor: "gray",

    "&:hover": {
        color: "white",
        borderColor: "white",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
});
