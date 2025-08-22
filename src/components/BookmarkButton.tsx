import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { EvaError } from "@eva-ics/webengine";
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
import { onEvaError, onSuccess } from "../common";

const iconButtonStyles = {
    display: "flex",
    backgroundColor: "#0085ff",
    color: "white",
    borderRadius: "2px",
    width: 30,
    height: 30,
    ml: { md: "1rem", xs: "auto" },
    mr: { xs: "1em" },
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

function useUrl(): string {
    const get = () =>
        window.location.pathname + window.location.search + window.location.hash;

    const [url, setUrl] = useState<string>(() => get());

    useLayoutEffect(() => {
        const w = window as any;
        if (!w.__historyPatched) {
            w.__historyPatched = true;

            const fire = () => window.dispatchEvent(new Event("locationchange"));

            const origPush = history.pushState;
            history.pushState = function (...args: any[]) {
                const ret = origPush.apply(this, args);
                fire();
                return ret;
            } as any;

            const origReplace = history.replaceState;
            history.replaceState = function (...args: any[]) {
                const ret = origReplace.apply(this, args);
                fire();
                return ret;
            } as any;

            window.addEventListener("popstate", fire);
            window.addEventListener("hashchange", fire);
        }

        const handler = () => setUrl(get());
        window.addEventListener("locationchange", handler);
        window.addEventListener("popstate", handler);
        window.addEventListener("hashchange", handler);

        handler();

        return () => {
            window.removeEventListener("locationchange", handler);
            window.removeEventListener("popstate", handler);
            window.removeEventListener("hashchange", handler);
        };
    }, []);

    return url;
}

export const BookmarkButton = ({ className }: { className?: string }) => {
    const [isOpedDialog, setIsOpenDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const url = useUrl();

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (saving) {
                return;
            }
            setSaving(true);

            try {
                let bookmarks: Bookmark[];
                try {
                    bookmarks = (await getUserData("va.opcentre.bookmarks")) || [];
                } catch (err) {
                    if (err instanceof EvaError && err.code === -32001) {
                        bookmarks = [];
                    } else {
                        throw err;
                    }
                }
                const formData = new FormData(formRef.current!);
                const rawName = formData.get("bookmarkName");
                const title = String(rawName).trim();

                bookmarks.push({
                    id: url,
                    title,
                });
                bookmarks.sort((a, b) =>
                    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
                );

                await setUserData<Bookmark[]>("va.opcentre.bookmarks", bookmarks);
                onSuccess("bookmark added");
            } catch (err) {
                onEvaError(err as EvaError);
                console.error("user_data.set error:", err);
            } finally {
                setIsOpenDialog(false);
                setSaving(false);
            }
        },
        [url, saving]
    );

    const onOpen = () => {
        setIsOpenDialog(true);
    };

    return (
        <>
            <IconButton
                className={className}
                sx={iconButtonStyles}
                aria-label="create bookmark"
                onClick={onOpen}
                title="add to bookmarks"
            >
                <BookmarkAddOutlinedIcon />
            </IconButton>
            <Dialog
                open={isOpedDialog}
                onClose={() => setIsOpenDialog(false)}
                sx={dialogStyles}
                maxWidth="xs"
                disableRestoreFocus
            >
                <DialogTitle>New Bookmark</DialogTitle>
                <DialogContent sx={dialogContentStyles}>
                    <form ref={formRef} onSubmit={handleSubmit} id="add-bookmark-form">
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Name"
                            name="bookmarkName"
                            type="text"
                            required
                            fullWidth
                            variant="outlined"
                            defaultValue={document.title}
                            InputLabelProps={InputLabelProps}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        form="add-bookmark-form"
                        fullWidth
                        variant="contained"
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
