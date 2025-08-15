import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
} from "@mui/material";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";

import { type Bookmark } from "../types";
import { getUserData, setUserData } from "../services";

const iconButtonStyles = {
    display: "flex",
    backgroundColor: "#0085ff",
    color: "white",
    borderRadius: "2px",
    ml: "auto",
    mr: {
        xs: "1em",
        md: "2em",
    },
    mt: "2rem",
    "&:hover": {
        backgroundColor: "primary.dark",
    },
};

const dialogStyles = { "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } };

const dialogContentStyles = {
    "& .MuiTextField-root": {
        ml: 0,
    },
};

const InputLabelProps = { shrink: true };

const buttonStyles = {
    backgroundColor: "#191d22",
    "&:hover": { backgroundColor: "#3a3c3f" },
};

export const BookmarkButton = () => {
    const [isOpedDialog, setIsOpenDialog] = useState(false);
    const [bookmarkName, setBookmarkName] = useState(document.title);
    const [saving, setSaving] = useState(false);
    const location = useLocation();

    const onSave = async () => {
        if (saving) {
            return;
        }
        setSaving(true);

        try {
            const bookmarks: Bookmark[] = (await getUserData("bookmarks")) || [];

            bookmarks.push({
                id: location.pathname + location.search,
                title: bookmarkName.trim(),
            });

            await setUserData<Bookmark[]>("bookmarks", bookmarks);
        } catch (err) {
            console.error("user_data.set error:", err);
        } finally {
            setIsOpenDialog(false);
            setSaving(false);
        }
    };

    const onOpen = () => {
        setIsOpenDialog(true);
        setBookmarkName(document.title);
    };

    return (
        <>
            <IconButton
                sx={iconButtonStyles}
                aria-label="create bookmark"
                onClick={onOpen}
            >
                <BookmarkAddOutlinedIcon />
            </IconButton>
            <Dialog
                open={isOpedDialog}
                onClose={() => setIsOpenDialog(false)}
                sx={dialogStyles}
                maxWidth="xs"
            >
                <DialogTitle>New Bookmark</DialogTitle>
                <DialogContent sx={dialogContentStyles}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        type="text"
                        required
                        fullWidth
                        variant="outlined"
                        value={bookmarkName}
                        onChange={(e) => setBookmarkName(e.target.value)}
                        InputLabelProps={InputLabelProps}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onSave}
                        sx={buttonStyles}
                        endIcon={<BookmarkAddOutlinedIcon />}
                    >
                        Add bookmark
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
