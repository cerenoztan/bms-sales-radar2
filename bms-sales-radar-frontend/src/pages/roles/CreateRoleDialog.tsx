import * as React from 'react';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (role: RoleFormData) => void;
}

const initialForm: RoleFormData = {
  name: '',
  code: '',
  description: '',
  isActive: true,
};

export default function CreateRoleDialog({
  open,
  onClose,
  onCreate,
}: CreateRoleDialogProps) {
  const [form, setForm] =
    React.useState<RoleFormData>(initialForm);

  const [error, setError] =
    React.useState('');

  React.useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError('');
    }
  }, [open]);

  const handleChange = (
    field: keyof RoleFormData,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    const code = form.code
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

    if (!name) {
      setError('Rol adı zorunludur.');
      return;
    }

    if (!code) {
      setError('Rol kodu zorunludur.');
      return;
    }

    onCreate({
      ...form,
      name,
      code,
      description: form.description.trim(),
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Yeni Rol</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="Rol Adı"
            value={form.name}
            onChange={(event) =>
              handleChange(
                'name',
                event.target.value,
              )
            }
            placeholder="Örneğin: Bölge Müdürü"
            fullWidth
            required
          />

          <TextField
            label="Rol Kodu"
            value={form.code}
            onChange={(event) =>
              handleChange(
                'code',
                event.target.value,
              )
            }
            placeholder="Örneğin: REGION_MANAGER"
            fullWidth
            required
            helperText="Kod büyük harf ve alt çizgi formatına dönüştürülür."
          />

          <TextField
            label="Açıklama"
            value={form.description}
            onChange={(event) =>
              handleChange(
                'description',
                event.target.value,
              )
            }
            fullWidth
            multiline
            rows={3}
          />

          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography>Rol aktif</Typography>

            <Switch
              checked={form.isActive}
              onChange={(event) =>
                handleChange(
                  'isActive',
                  event.target.checked,
                )
              }
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          İptal
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}