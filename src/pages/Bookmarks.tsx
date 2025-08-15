import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashTable, DashTableData, DashTableFilter } from "bmat/dashtable";

import { Bookmark } from "../types";
import ModalDialog from "../components/mui/ModalDialog";
import { getUserData, setUserData } from "../services";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";

const cols = ["Name", "", ""];
const pageStyles: React.CSSProperties = { marginTop: 50 };
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

const Bookmarks = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [nameFilter, setNameFilter] = useState("");
    const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = (await getUserData<Bookmark[]>("bookmarks")) ?? [];
                setBookmarks(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load bookmarks");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filterValue = nameFilter.trim().toLowerCase();
    const filtered = !filterValue
        ? bookmarks
        : bookmarks.filter(
              (b) =>
                  b.id.toLowerCase().includes(filterValue) ||
                  b.title.toLowerCase().includes(filterValue)
          );

    const tableFilter: DashTableFilter = [
        [
            "Filter:",
            <input
                key="nameFilter"
                size={15}
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Search…"
                aria-label="Filter bookmarks"
            />,
        ],
    ];

    const tableRows: DashTableData = filtered.map((b) => {
        const url = b.id;
        const title = b.title;
        return {
            data: [
                {
                    value: <Link to={url}>{title}</Link>,
                    sort_value: title,
                },
                {
                    value: <button onClick={() => setEditingBookmark(b)}>edit</button>,
                    className: "col-fit",
                },
                {
                    value: (
                        <button
                            className="btn-delete"
                            onClick={() => setBookmarkToDelete(b)}
                            aria-label={`Delete "${title}"`}
                        >
                            delete
                        </button>
                    ),
                    className: "col-fit",
                },
            ],
        };
    });

    const closeDeleteModal = () => setBookmarkToDelete(null);

    const handleDeleteBookmark = async () => {
        if (!bookmarkToDelete) {
            return;
        }

        const next = bookmarks.filter(
            (b) => !(b.id === bookmarkToDelete.id && b.title === bookmarkToDelete.title)
        );

        try {
            await setUserData<Bookmark[]>("bookmarks", next);
            setBookmarks(next);
        } catch (err) {
            console.error("user_data.set error:", err);
            setError(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setBookmarkToDelete(null);
        }
    };

    const handleEditBookmark = async () => {
        if (!editingBookmark) {
            return;
        }

        const next = bookmarks.filter(
            (b) => !(b.id === editingBookmark.id && b.title === editingBookmark.title)
        );
        next.push({ id: editingBookmark.id, title: newName });

        try {
            await setUserData<Bookmark[]>("bookmarks", next);
            setBookmarks(next);
        } catch (err) {
            console.error("Failed to edit bookmark:", err);
            setError(err instanceof Error ? err.message : "Failed to edit");
        } finally {
            setEditingBookmark(null);
        }
    };

    return (
        <div
            className="dashboard-main-wrapper dashboard-main-wrapper-big"
            style={pageStyles}
        >
            <div className="dashboard-main-wrapper-content">
                <div className="dashboard-main-wrapper-content__side-left">
                    {error && <div role="alert">{error}</div>}
                    {loading ? (
                        <div>Loading…</div>
                    ) : (
                        <DashTable
                            id="bookmarksTable"
                            title="Bookmarks"
                            cols={cols}
                            filter={tableFilter}
                            data={tableRows}
                            className="content-longtable table-items"
                            rememberQs
                        />
                    )}

                    {bookmarkToDelete && (
                        <ModalDialog
                            open
                            title={`Delete the bookmark "${bookmarkToDelete.title}"?`}
                            onClose={closeDeleteModal}
                            onConfirm={handleDeleteBookmark}
                        />
                    )}
                    <Dialog
                        open={!!editingBookmark}
                        onClose={() => setEditingBookmark(null)}
                        sx={dialogStyles}
                        maxWidth="xs"
                    >
                        <DialogTitle>Edit Bookmark</DialogTitle>
                        <DialogContent sx={dialogContentStyles}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Name"
                                type="text"
                                required
                                fullWidth
                                variant="outlined"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                InputLabelProps={InputLabelProps}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleEditBookmark}
                                sx={buttonStyles}
                            >
                                Edit bookmark
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Bookmarks;
