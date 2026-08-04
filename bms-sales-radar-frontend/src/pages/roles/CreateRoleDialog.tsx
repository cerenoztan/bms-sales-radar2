import * as React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export interface CreateRolePayload {
  name: string;
  isActive: boolean;
}

interface CreateRoleDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (
    payload: CreateRolePayload,
  ) => Promise<void>;
}

const initialForm: CreateRolePayload = {
  name: '',
  isActive: true,
};

export default function CreateRoleDialog({
  open,
  loading,
  onClose,
  onCreate,
}: CreateRoleDialogProps) {
  const [form, setForm] =
    React.useState<CreateRolePayload>(
      initialForm,
    );

  const [error, setError] =
    React.useState('');

  React.useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    const name = form.name.trim();

    if (!name) {
      setError('Rol adı zorunludur.');
      return;
    }

    try {
      setError('');

      await onCreate({
        name,
        isActive: form.isActive,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Rol oluşturulamadı.',
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Yeni Rol
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{ pt: 1 }}
        >
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="Rol Adı"
            value={form.name}
            disabled={loading}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name:
                  event.target.value,
              }))
            }
            required
            fullWidth
          />

          <Stack
            direction="row"
            sx={{
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>
              Rol aktif
            </Typography>

            <Switch
              checked={form.isActive}
              disabled={loading}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive:
                    event.target.checked,
                }))
              }
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          İptal
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={() =>
            void handleSubmit()
          }
        >
          {loading
            ? 'Kaydediliyor...'
            : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}