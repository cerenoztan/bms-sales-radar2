import * as React from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import CreateRoleDialog from './CreateRoleDialog';
import type { CreateRolePayload } from './CreateRoleDialog';

const API_URL = 'http://localhost:3000';

interface Role {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

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

export default function RolesPage() {
  const [roles, setRoles] =
    React.useState<Role[]>([]);

  const [loading, setLoading] =
    React.useState(true);

  const [createOpen, setCreateOpen] =
    React.useState(false);

  const [creating, setCreating] =
    React.useState(false);

  const [editingRole, setEditingRole] =
    React.useState<Role | null>(null);

  const [updating, setUpdating] =
    React.useState(false);

  const [deletingRole, setDeletingRole] =
    React.useState<Role | null>(null);

  const [deleting, setDeleting] =
    React.useState(false);

  const [snackbar, setSnackbar] =
    React.useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success',
    });

  const loadRoles =
    React.useCallback(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/roles`,
        );

        const data =
          await readResponse<Role[]>(
            response,
          );

        setRoles(data);
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : 'Roller yüklenemedi.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }, []);

  React.useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleCreate = async (
    payload: CreateRolePayload,
  ) => {
    try {
      setCreating(true);

      const response = await fetch(
        `${API_URL}/roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const createdRole =
        await readResponse<Role>(
          response,
        );

      setRoles((current) => [
        ...current,
        createdRole,
      ]);

      setCreateOpen(false);

      setSnackbar({
        open: true,
        message: 'Rol oluşturuldu.',
        severity: 'success',
      });
    } catch (error) {
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) {
      return;
    }

    const name =
      editingRole.name.trim();

    if (!name) {
      setSnackbar({
        open: true,
        message:
          'Rol adı boş bırakılamaz.',
        severity: 'error',
      });

      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `${API_URL}/roles/${editingRole.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            isActive:
              editingRole.isActive,
          }),
        },
      );

      const updatedRole =
        await readResponse<Role>(
          response,
        );

      setRoles((current) =>
        current.map((role) =>
          role.id === updatedRole.id
            ? updatedRole
            : role,
        ),
      );

      setEditingRole(null);

      setSnackbar({
        open: true,
        message: 'Rol güncellendi.',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Rol güncellenemedi.',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_URL}/roles/${deletingRole.id}`,
        {
          method: 'DELETE',
        },
      );

      await readResponse<{
        message: string;
      }>(response);

      setRoles((current) =>
        current.filter(
          (role) =>
            role.id !== deletingRole.id,
        ),
      );

      setDeletingRole(null);

      setSnackbar({
        open: true,
        message: 'Rol silindi.',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Rol silinemedi.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent:
            'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Rol Tanımlama
          </Typography>

          <Typography color="text.secondary">
            Sistemde kullanılacak rolleri
            yönetin.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            setCreateOpen(true)
          }
        >
          Yeni Rol
        </Button>
      </Stack>

      {loading ? (
        <Stack
          sx={{
            minHeight: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Stack>
      ) : roles.length === 0 ? (
        <Alert severity="info">
          Henüz rol tanımlanmamış.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {roles.map((role) => (
            <Card
              key={role.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: 'column',
                    md: 'row',
                  }}
                  spacing={2}
                  sx={{
                    justifyContent:
                      'space-between',
                    alignItems: {
                      xs: 'flex-start',
                      md: 'center',
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {role.name}
                    </Typography>

                    <Chip
                      label={
                        role.isActive
                          ? 'Aktif'
                          : 'Pasif'
                      }
                      color={
                        role.isActive
                          ? 'success'
                          : 'default'
                      }
                      size="small"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <EditOutlinedIcon />
                      }
                      onClick={() =>
                        setEditingRole({
                          ...role,
                        })
                      }
                    >
                      Düzenle
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={
                        <DeleteIcon />
                      }
                      onClick={() =>
                        setDeletingRole(role)
                      }
                    >
                      Sil
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <CreateRoleDialog
        open={createOpen}
        loading={creating}
        onClose={() =>
          setCreateOpen(false)
        }
        onCreate={handleCreate}
      />

      <Dialog
        open={Boolean(editingRole)}
        onClose={
          updating
            ? undefined
            : () =>
                setEditingRole(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Rolü Düzenle
        </DialogTitle>

        <DialogContent>
          {editingRole && (
            <Stack
              spacing={2}
              sx={{ pt: 1 }}
            >
              <TextField
                label="Rol Adı"
                value={editingRole.name}
                disabled={updating}
                onChange={(event) =>
                  setEditingRole({
                    ...editingRole,
                    name:
                      event.target.value,
                  })
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
                  checked={
                    editingRole.isActive
                  }
                  disabled={updating}
                  onChange={(event) =>
                    setEditingRole({
                      ...editingRole,
                      isActive:
                        event.target
                          .checked,
                    })
                  }
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            disabled={updating}
            onClick={() =>
              setEditingRole(null)
            }
          >
            İptal
          </Button>

          <Button
            variant="contained"
            disabled={updating}
            onClick={() =>
              void handleUpdate()
            }
          >
            {updating
              ? 'Kaydediliyor...'
              : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingRole)}
        onClose={
          deleting
            ? undefined
            : () =>
                setDeletingRole(null)
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Rolü Sil
        </DialogTitle>

        <DialogContent>
          <Typography>
            <strong>
              {deletingRole?.name}
            </strong>{' '}
            rolünü silmek istediğinize
            emin misiniz?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            disabled={deleting}
            onClick={() =>
              setDeletingRole(null)
            }
          >
            İptal
          </Button>

          <Button
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={() =>
              void handleDelete()
            }
          >
            {deleting
              ? 'Siliniyor...'
              : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((current) => ({
              ...current,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}