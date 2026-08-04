import * as React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const API_URL = 'http://localhost:3000';

interface Role {
  id: number;
  name: string;
  isActive: boolean;
}

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  roleId: number | '';
  isActive: boolean;
}

const initialForm: CreateUserForm = {
  fullName: '',
  email: '',
  password: '',
  roleId: '',
  isActive: true,
};

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(' ')
        : data?.message ??
          `İstek başarısız oldu. HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export default function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps) {
  const [form, setForm] =
    React.useState<CreateUserForm>(
      initialForm,
    );

  const [roles, setRoles] =
    React.useState<Role[]>([]);

  const [loadingRoles, setLoadingRoles] =
    React.useState(false);

  const [saving, setSaving] =
    React.useState(false);

  const [error, setError] =
    React.useState('');

  const loadRoles =
    React.useCallback(async () => {
      try {
        setLoadingRoles(true);
        setError('');

        const response = await fetch(
          `${API_URL}/roles`,
        );

        const data =
          await readResponse<Role[]>(
            response,
          );

        const activeRoles =
          data.filter(
            (role) => role.isActive,
          );

        setRoles(activeRoles);

        setForm((current) => ({
          ...current,
          roleId:
            activeRoles[0]?.id ?? '',
        }));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Roller yüklenemedi.',
        );
      } finally {
        setLoadingRoles(false);
      }
    }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialForm);
    setError('');

    void loadRoles();
  }, [open, loadRoles]);

  const handleSubmit = async () => {
    const fullName =
      form.fullName.trim();

    const email = form.email
      .trim()
      .toLowerCase();

    if (!fullName) {
      setError(
        'Ad soyad alanı zorunludur.',
      );
      return;
    }

    if (!email) {
      setError(
        'E-posta alanı zorunludur.',
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        'Şifre en az 6 karakter olmalıdır.',
      );
      return;
    }

    if (form.roleId === '') {
      setError('Rol seçilmelidir.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token =
        localStorage.getItem(
          'accessToken',
        ) ??
        sessionStorage.getItem(
          'accessToken',
        );

      const response = await fetch(
        `${API_URL}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            fullName,
            email,
            password: form.password,
            roleId: form.roleId,
            isActive: form.isActive,
          }),
        },
      );

      await readResponse(response);

      onCreated();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Kullanıcı oluşturulamadı.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={
        saving ? undefined : onClose
      }
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
            disabled={saving}
            required
            fullWidth
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName:
                  event.target.value,
              }))
            }
          />

          <TextField
            label="E-posta"
            type="email"
            value={form.email}
            disabled={saving}
            required
            fullWidth
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email:
                  event.target.value,
              }))
            }
          />

          <TextField
            label="Şifre"
            type="password"
            value={form.password}
            disabled={saving}
            required
            fullWidth
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password:
                  event.target.value,
              }))
            }
          />

          <FormControl
            fullWidth
            required
            disabled={
              saving || loadingRoles
            }
          >
            <InputLabel id="role-label">
              Rol
            </InputLabel>

            <Select
              labelId="role-label"
              label="Rol"
              value={form.roleId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  roleId:
                    Number(
                      event.target.value,
                    ),
                }))
              }
            >
              {roles.map((role) => (
                <MenuItem
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingRoles && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
              }}
            >
              <CircularProgress
                size={18}
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Roller yükleniyor...
              </Typography>
            </Stack>
          )}

          {!loadingRoles &&
            roles.length === 0 && (
              <Alert severity="warning">
                Aktif rol bulunamadı.
                Önce Rol Tanımlama
                sayfasından rol oluşturun.
              </Alert>
            )}

          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent:
                'space-between',
            }}
          >
            <Typography>
              Aktif kullanıcı
            </Typography>

            <Switch
              checked={form.isActive}
              disabled={saving}
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
          disabled={saving}
        >
          İptal
        </Button>

        <Button
          variant="contained"
          disabled={
            saving ||
            loadingRoles ||
            roles.length === 0
          }
          onClick={() =>
            void handleSubmit()
          }
        >
          {saving
            ? 'Kaydediliyor...'
            : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}