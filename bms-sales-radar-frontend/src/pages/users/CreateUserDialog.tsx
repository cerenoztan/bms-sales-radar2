import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

type UserRole =
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  jobTitle: string;
  isActive: boolean;
}

const initialForm: CreateUserForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'SALES_REP',
  jobTitle: '',
  isActive: true,
};

export default function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps) {
  const [form, setForm] =
    useState<CreateUserForm>(initialForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const handleChange = (
    field: keyof CreateUserForm,
    value: string | boolean,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleDialogClose = () => {
    if (loading) {
      return;
    }

    setForm(initialForm);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.fullName.trim()) {
      setError('Ad soyad alanı zorunludur.');
      return;
    }

    if (!form.email.trim()) {
      setError('E-posta alanı zorunludur.');
      return;
    }

    if (!form.password.trim()) {
      setError('Şifre alanı zorunludur.');
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem('accessToken') ??
        sessionStorage.getItem('accessToken');

      const response = await fetch(
        'http://localhost:3000/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
            jobTitle:
              form.jobTitle.trim() || undefined,
            isActive: form.isActive,
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const message = Array.isArray(
          responseData.message,
        )
          ? responseData.message.join(', ')
          : responseData.message;

        throw new Error(
          message ?? 'Kullanıcı oluşturulamadı.',
        );
      }

      setForm(initialForm);
      setError(null);

      onCreated();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Beklenmeyen bir hata oluştu.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Yeni Kullanıcı
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
            label="Ad Soyad"
            value={form.fullName}
            onChange={(event) =>
              handleChange(
                'fullName',
                event.target.value,
              )
            }
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="E-posta"
            type="email"
            value={form.email}
            onChange={(event) =>
              handleChange(
                'email',
                event.target.value,
              )
            }
            fullWidth
            required
          />

          <TextField
            label="Şifre"
            type="password"
            value={form.password}
            onChange={(event) =>
              handleChange(
                'password',
                event.target.value,
              )
            }
            fullWidth
            required
          />

          <TextField
            label="Rol"
            select
            value={form.role}
            onChange={(event) =>
              handleChange(
                'role',
                event.target.value as UserRole,
              )
            }
            fullWidth
          >
            <MenuItem value="ADMIN">
              Admin
            </MenuItem>

            <MenuItem value="SALES_MANAGER">
              Satış Müdürü
            </MenuItem>

            <MenuItem value="SALES_REP">
              Satış Temsilcisi
            </MenuItem>
          </TextField>

          <TextField
            label="Ünvan"
            value={form.jobTitle}
            onChange={(event) =>
              handleChange(
                'jobTitle',
                event.target.value,
              )
            }
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(event) =>
                  handleChange(
                    'isActive',
                    event.target.checked,
                  )
                }
              />
            }
            label={
              form.isActive
                ? 'Aktif kullanıcı'
                : 'Pasif kullanıcı'
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleDialogClose}
          disabled={loading}
        >
          İptal
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : undefined
          }
        >
          {loading
            ? 'Kaydediliyor'
            : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}