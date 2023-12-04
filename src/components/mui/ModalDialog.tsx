import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

interface ModalProps{
    title: string;
    contentText?: string;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}


const ModalDialog = ({open, title, contentText, onClose, onConfirm, ...other}:ModalProps) => {
   

  const handleClose = () => {
        onClose();
  };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm(); 
    }
  };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onKeyUp={handleKeyDown} 
            aria-labelledby="modal_dialog_title"
            aria-describedby="modal_dialog_description"
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
            maxWidth="xs"
            {...other}
        >
            <DialogTitle id="modal_dialog_title">{title }</DialogTitle>
            <DialogContent>
                <DialogContentText id="modal_dialog_description">
                    {contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button id="modal_dialog_cancel_btn" variant="outlined" onClick={handleClose} sx={{border:"1px solid #191d22", color:"#191d22","&:hover": { borderColor: "#d16d41",color:"#d16d41"},}}>
                Cancel
                </Button>
                <Button
                    id="modal_dialog_confirm_btn"
                    onClick={onConfirm}
                    autoFocus
                    variant="contained"
                    sx={{backgroundColor:"#191d22","&:hover":{backgroundColor:"#3a3c3f"}}}
                >
                   Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};



export default ModalDialog;
