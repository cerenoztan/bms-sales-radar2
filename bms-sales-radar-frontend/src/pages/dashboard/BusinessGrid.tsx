import * as React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { DataGrid } from '@mui/x-data-grid';

import type {
  GridColDef,
  GridRowId,
} from '@mui/x-data-grid';
import { authenticatedFetch } from '../../auth/authStorage';

const API_URL = 'http://localhost:3000';

interface BusinessRow {
  id: number;
  name: string;
  address?: string | null;
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

  const [selectedRowId, setSelectedRowId] =
    React.useState<GridRowId | null>(null);

  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadBusinesses = React.useCallback(async () => {
    try {
      setLoading(true);

      const response = await authenticatedFetch(`${API_URL}/businesses`);

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

  const handleEdit = (id: GridRowId) => {
    alert(`${id} numaralı işletme düzenlenecek.`);
  };

  const columns: GridColDef<BusinessRow>[] = [
    {
      field: 'name',
      headerName: 'İşletme',
      flex: 1.3,
      minWidth: 220,
    },
    {
      field: 'address',
      headerName: 'Adres',
      flex: 1.8,
      minWidth: 240,
      valueFormatter: (value) => value ?? '-',
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
      minWidth: 150,
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
            Yeni Açılacak İşletmeler
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Haftalık Tablo
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          disabled={selectedRowId === null}
          onClick={() => {
            if (selectedRowId !== null) {
              handleEdit(selectedRowId);
            }
          }}
        >
          Düzenle
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
          onRowClick={(params) => {
            setSelectedRowId(params.id);
          }}
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
    </Box>
  );
}
