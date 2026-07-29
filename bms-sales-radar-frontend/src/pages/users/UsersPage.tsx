import * as React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import CreateUserDialog from './CreateUserDialog';

const API_URL = 'http://localhost:3000';

type UserRole =
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP';

interface UserRow {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  jobTitle?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Yönetici';

    case 'SALES_MANAGER':
      return 'Satış Müdürü';

    case 'SALES_REP':
      return 'Satış Temsilcisi';

    default:
      return role;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function UsersPage() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [createDialogOpen, setCreateDialogOpen] =
    React.useState(false);

  const [snackbar, setSnackbar] =
    React.useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success',
    });

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem('accessToken') ??
        sessionStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Kullanıcılar alınamadı. HTTP ${response.status}`,
        );
      }

      const data: UserRow[] = await response.json();

      setRows(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Kullanıcılar yüklenirken hata oluştu.';

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleUserCreated = async () => {
    await loadUsers();

    setSnackbar({
      open: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      severity: 'success',
    });
  };

  const columns: GridColDef<UserRow>[] = [
    {
      field: 'fullName',
      headerName: 'Ad Soyad',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'email',
      headerName: 'E-posta',
      flex: 1.4,
      minWidth: 220,
    },
    {
      field: 'role',
      headerName: 'Rol',
      minWidth: 170,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={getRoleLabel(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'jobTitle',
      headerName: 'Görev',
      flex: 1.3,
      minWidth: 220,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'createdAt',
      headerName: 'Katılma Tarihi',
      minWidth: 150,
      valueFormatter: (value) =>
        value ? formatDate(value) : '-',
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      minWidth: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Aktif' : 'Pasif'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
  ];

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
          justifyContent: 'space-between',
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
            Kullanıcılar
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Sisteme kayıtlı ekip üyeleri
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Yeni Kullanıcı
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          minHeight: 480,
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          sx={{
            border: 0,
            height: '100%',

            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
            },

            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },

            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },

            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Paper>

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

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          void handleUserCreated();
        }}
      />
    </Box>
  );
}