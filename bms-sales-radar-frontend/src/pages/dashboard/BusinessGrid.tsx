import * as React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
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

interface BusinessRow {
  id: number;
  name: string;
  city: string;
  phone: string;
  source: string;
  score: number;
  status: 'Yüksek' | 'Orta' | 'Düşük';
}

const initialRows: BusinessRow[] = [
  {
    id: 1,
    name: 'Örnek Yapı Market',
    city: 'İstanbul',
    phone: '0532 111 22 33',
    source: 'FilGezi',
    score: 87,
    status: 'Yüksek',
  },
  {
    id: 2,
    name: 'Mavi Dekorasyon',
    city: 'Ankara',
    phone: '0544 222 33 44',
    source: 'FilGezi',
    score: 64,
    status: 'Orta',
  },
  {
    id: 3,
    name: 'Güven İnşaat',
    city: 'İzmir',
    phone: '0555 333 44 55',
    source: 'Manuel',
    score: 38,
    status: 'Düşük',
  },
];

export default function BusinessGrid() {
  const [rows, setRows] =
    React.useState<BusinessRow[]>(initialRows);

  const handleCreate = () => {
    alert('Yeni işletme formu sonraki adımda eklenecek.');
  };

  const handleEdit = (id: GridRowId) => {
    alert(`${id} numaralı işletme düzenlenecek.`);
  };

  const handleDelete = (id: GridRowId) => {
    const shouldDelete = window.confirm(
      'Bu işletmeyi silmek istediğinize emin misiniz?',
    );

    if (!shouldDelete) {
      return;
    }

    setRows((currentRows) =>
      currentRows.filter((row) => row.id !== id),
    );
  };

  const columns: GridColDef<BusinessRow>[] = [
    {
      field: 'name',
      headerName: 'İşletme',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'city',
      headerName: 'Şehir',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'phone',
      headerName: 'Telefon',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'source',
      headerName: 'Kaynak',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'score',
      headerName: 'Skor',
      width: 90,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Öncelik',
      width: 120,
      renderCell: (params) => {
        const color =
          params.value === 'Yüksek'
            ? 'error'
            : params.value === 'Orta'
              ? 'warning'
              : 'success';

        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="İşletmeyi düzenle"
            onClick={() => handleEdit(params.id)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            aria-label="İşletmeyi sil"
            onClick={() => handleDelete(params.id)}
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
            onClick={() => setRows(initialRows)}
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
    </Box>
  );
}