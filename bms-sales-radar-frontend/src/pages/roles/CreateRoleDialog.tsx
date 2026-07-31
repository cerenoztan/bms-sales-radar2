import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRoleDialog({
  open,
  onClose,
}: CreateRoleDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Yeni Rol</DialogTitle>

      <DialogContent>
        <TextField
          label="Rol Adı"
          fullWidth
          margin="normal"
        />

        <TextField
          label="Rol Kodu"
          fullWidth
          margin="normal"
        />

        <TextField
          label="Açıklama"
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>

        <Button variant="contained">
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}