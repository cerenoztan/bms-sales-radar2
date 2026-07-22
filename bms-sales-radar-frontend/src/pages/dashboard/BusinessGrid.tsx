import * as React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { DataGrid } from '@mui/x-data-grid';

import type {
  GridColDef,
  GridRowId,
} from '@mui/x-data-grid';

const API_URL = 'http://localhost:3000';

interface BusinessRow {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  instagramUrl?: string | null;
  score?: number;
  salesPriority?: string;
  status: string;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

function getPriorityColor(
  priority?: string,
): 'error' | 'warning' | 'success' | 'default' {
  switch (priority) {
    case 'HIGH':
      return 'error';

    case 'MEDIUM':
      return 'warning';

    case 'LOW':
      return 'success';

    default:
      return 'default';
  }
}

function getPriorityLabel(priority?: string): string {
  switch (priority) {
    case 'HIGH':
      return 'Yüksek';

    case 'MEDIUM':
      return 'Orta';

    case 'LOW':
      return 'Düşük';

    default:
      return priority ?? '-';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'NEW':
      return 'Yeni';

    case 'VERIFIED':
      return 'Doğrulandı';

    case 'DUPLICATE':
      return 'Tekrar';

    case 'CONTACTED':
      return 'İletişime Geçildi';

    case 'VISIT_PLANNED':
      return 'Ziyaret Planlandı';

    case 'OFFER_CREATED':
      return 'Teklif Oluşturuldu';

    case 'WON':
      return 'Kazanıldı';

    case 'LOST':
      return 'Kaybedildi';

    default:
      return status;
  }
}

export default function BusinessGrid() {
  const [rows, setRows] = React.useState<BusinessRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadBusinesses = React.useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/businesses`);

      if (!response.ok) {
        throw new Error(
          `İşletmeler alınamadı. HTTP ${response.status}`,
        );
      }

      const data: BusinessRow[] = await response.json();

      setRows(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'İşletmeler yüklenirken bir hata oluştu.';

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
    void loadBusinesses();
  }, [loadBusinesses]);

  const handleCreate = () => {
    alert('Yeni işletme formu sonraki adımda eklenecek.');
  };

  const handleEdit = (id: GridRowId) => {
    alert(`${id} numaralı işletme düzenlenecek.`);
  };

  const handleDelete = async (id: GridRowId) => {
    const shouldDelete = window.confirm(
      'Bu işletmeyi silmek istediğinize emin misiniz?',
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/businesses/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(
          `İşletme silinemedi. HTTP ${response.status}`,
        );
      }

      setRows((currentRows) =>
        currentRows.filter((row) => row.id !== Number(id)),
      );

      setSnackbar({
        open: true,
        message: 'İşletme başarıyla silindi.',
        severity: 'success',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'İşletme silinirken bir hata oluştu.';

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    }
  };

  const columns: GridColDef<BusinessRow>[] = [
    {
      field: 'name',
      headerName: 'İşletme',
      flex: 1.3,
      minWidth: 180,
    },
    {
      field: 'address',
      headerName: 'Adres',
      flex: 1.8,
      minWidth: 240,
    },
    {
      field: 'phone',
      headerName: 'Telefon',
      flex: 1,
      minWidth: 140,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'instagramUrl',
      headerName: 'Instagram',
      flex: 1.2,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) {
          return '-';
        }

        return (
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            onClick={(event) => event.stopPropagation()}
          >
            Profili aç
          </Link>
        );
      },
    },
    {
      field: 'score',
      headerName: 'Skor',
      width: 90,
      type: 'number',
      valueFormatter: (value) => value ?? 0,
    },
    {
      field: 'salesPriority',
      headerName: 'Öncelik',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getPriorityLabel(params.value)}
          color={getPriorityColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      minWidth: 170,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="İşletmeyi düzenle"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(params.id);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            aria-label="İşletmeyi sil"
            onClick={(event) => {
              event.stopPropagation();
              void handleDelete(params.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
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
            İşletmeler
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Potansiyel müşterileri görüntüleyin ve yönetin.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading}
            onClick={() => void loadBusinesses()}
          >
            Yenile
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Yeni işletme
          </Button>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          checkboxSelection
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
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

            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
            },

            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
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
    </Box>
  );
}