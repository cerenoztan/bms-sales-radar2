import * as React from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import CreateRoleDialog from './CreateRoleDialog';
import type { RoleFormData } from './CreateRoleDialog';

interface Role extends RoleFormData {
  id: number;
}

const initialRoles: Role[] = [
  {
    id: 1,
    name: 'Yönetici',
    code: 'ADMIN',
    description:
      'Sistemdeki tüm işlemlere erişebilir.',
    isActive: true,
  },
  {
    id: 2,
    name: 'Satış Müdürü',
    code: 'SALES_MANAGER',
    description:
      'Satış ekibini ve satış kayıtlarını yönetebilir.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Satış Temsilcisi',
    code: 'SALES_REP',
    description:
      'Kendi satış kayıtlarını görüntüleyebilir.',
    isActive: true,
  },
];

export default function RolesPage() {
  const [roles, setRoles] =
    React.useState<Role[]>(initialRoles);

  const [createOpen, setCreateOpen] =
    React.useState(false);

  const [editingRole, setEditingRole] =
    React.useState<Role | null>(null);

  const [deletingRole, setDeletingRole] =
    React.useState<Role | null>(null);

  const [snackbar, setSnackbar] =
    React.useState({
      open: false,
      message: '',
    });

  const handleCreate = (
    data: RoleFormData,
  ) => {
    const duplicate = roles.some(
      (role) => role.code === data.code,
    );

    if (duplicate) {
      setSnackbar({
        open: true,
        message:
          'Bu rol kodu zaten kullanılıyor.',
      });
      return;
    }

    setRoles((current) => [
      ...current,
      {
        id:
          current.length === 0
            ? 1
            : Math.max(
                ...current.map(
                  (role) => role.id,
                ),
              ) + 1,
        ...data,
      },
    ]);

    setSnackbar({
      open: true,
      message: 'Yeni rol eklendi.',
    });
  };

  const handleEditSave = () => {
    if (!editingRole) {
      return;
    }

    const name =
      editingRole.name.trim();

    const code = editingRole.code
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

    if (!name || !code) {
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.id !== editingRole.id &&
        role.code === code,
    );

    if (duplicate) {
      setSnackbar({
        open: true,
        message:
          'Bu rol kodu başka bir rolde kullanılıyor.',
      });
      return;
    }

    setRoles((current) =>
      current.map((role) =>
        role.id === editingRole.id
          ? {
              ...editingRole,
              name,
              code,
              description:
                editingRole.description.trim(),
            }
          : role,
      ),
    );

    setEditingRole(null);

    setSnackbar({
      open: true,
      message: 'Rol güncellendi.',
    });
  };

  const handleDelete = () => {
    if (!deletingRole) {
      return;
    }

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
    });
  };

  const handleActiveChange = (
    roleId: number,
    checked: boolean,
  ) => {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              isActive: checked,
            }
          : role,
      ),
    );
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

          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            Sistemde kullanılacak rolleri
            oluşturun ve yönetin.
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

      <Stack spacing={2}>
        {roles.map((role) => (
          <Card
            key={role.id}
            variant="outlined"
            sx={{ borderRadius: 3 }}
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
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {role.name}
                    </Typography>

                    <Chip
                      label={role.code}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={
                        role.isActive
                          ? 'Aktif'
                          : 'Pasif'
                      }
                      size="small"
                      color={
                        role.isActive
                          ? 'success'
                          : 'default'
                      }
                    />
                  </Stack>

                  <Typography
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {role.description ||
                      'Açıklama bulunmuyor.'}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Switch
                    checked={role.isActive}
                    disabled={
                      role.code === 'ADMIN'
                    }
                    onChange={(event) =>
                      handleActiveChange(
                        role.id,
                        event.target.checked,
                      )
                    }
                  />

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
                      <DeleteOutlineOutlinedIcon />
                    }
                    disabled={
                      role.code === 'ADMIN'
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

      <CreateRoleDialog
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onCreate={handleCreate}
      />

      <Dialog
        open={Boolean(editingRole)}
        onClose={() =>
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
                onChange={(event) =>
                  setEditingRole({
                    ...editingRole,
                    name:
                      event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="Rol Kodu"
                value={editingRole.code}
                disabled={
                  editingRole.code ===
                  'ADMIN'
                }
                onChange={(event) =>
                  setEditingRole({
                    ...editingRole,
                    code:
                      event.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                label="Açıklama"
                value={
                  editingRole.description
                }
                onChange={(event) =>
                  setEditingRole({
                    ...editingRole,
                    description:
                      event.target.value,
                  })
                }
                multiline
                rows={3}
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
                  disabled={
                    editingRole.code ===
                    'ADMIN'
                  }
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
            onClick={() =>
              setEditingRole(null)
            }
          >
            İptal
          </Button>

          <Button
            variant="contained"
            onClick={handleEditSave}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingRole)}
        onClose={() =>
          setDeletingRole(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Rolü sil
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning">
            <strong>
              {deletingRole?.name}
            </strong>{' '}
            rolü silinecek. Bu işlem mevcut
            frontend listesinden rolü kaldırır.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeletingRole(null)
            }
          >
            İptal
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          variant="filled"
          severity="success"
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