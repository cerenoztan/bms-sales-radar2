import * as React from 'react';

import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  authenticatedFetch,
  getAccessToken,
  hasPermission,
} from '../../auth/authStorage';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

function getDownloadFileName(response: Response): string {
  const disposition = response.headers.get('content-disposition');
  const fileNameMatch = disposition?.match(/filename="?([^";]+)"?/i);

  return fileNameMatch?.[1] ?? 'saved-candidates.xlsx';
}

interface SavedCandidate {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  status: string;
  discoverySource?: string;
  notes?: string;
  postingDate?: string;
  createdAt: string;
}

function formatDate(value?: string): string {
  if (!value) return 'Belirlenemedi';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Belirlenemedi';

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

const statusOptions = [
  ['NEW', 'Yeni aday'],
  ['VERIFIED', 'Doğrulandı'],
  ['CONTACTED', 'İletişime geçildi'],
  ['VISIT_PLANNED', 'Ziyaret planlandı'],
  ['OFFER_CREATED', 'Teklif oluşturuldu'],
  ['WON', 'Kazanıldı'],
  ['LOST', 'Kaybedildi'],
] as const;

type StatusFilter = 'ALL' | (typeof statusOptions)[number][0];
type PostingDateFilter = 'ALL' | 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH';

const postingDateFilterOptions: Array<[PostingDateFilter, string, number?]> = [
  ['ALL', 'Tüm ilan tarihleri'],
  ['LAST_DAY', 'Son 1 gün', 1],
  ['LAST_WEEK', 'Son 1 hafta', 7],
  ['LAST_MONTH', 'Son 1 ay', 30],
];

function getStatusLabel(status: string): string {
  return statusOptions.find(([value]) => value === status)?.[1] ?? status;
}

export default function ReportsPage() {
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [candidates, setCandidates] = React.useState<SavedCandidate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingCandidate, setEditingCandidate] =
    React.useState<SavedCandidate | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');
  const [sourceFilter, setSourceFilter] = React.useState('ALL');
  const [postingDateFilter, setPostingDateFilter] =
    React.useState<PostingDateFilter>('ALL');

  const sourceOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .map((candidate) => candidate.discoverySource?.trim())
            .filter((source): source is string => Boolean(source)),
        ),
      ).sort((first, second) => first.localeCompare(second, 'tr')),
    [candidates],
  );

  const filteredCandidates = React.useMemo(
    () => {
      const selectedDateOption = postingDateFilterOptions.find(
        ([value]) => value === postingDateFilter,
      );
      const days = selectedDateOption?.[2];
      const cutoffDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

      return candidates.filter((candidate) => {
        const postingDate = candidate.postingDate
          ? new Date(candidate.postingDate)
          : null;
        const matchesPostingDate =
          !cutoffDate ||
          (postingDate !== null &&
            !Number.isNaN(postingDate.getTime()) &&
            postingDate >= cutoffDate);

        return (
          (statusFilter === 'ALL' || candidate.status === statusFilter) &&
          (sourceFilter === 'ALL' || candidate.discoverySource === sourceFilter) &&
          matchesPostingDate
        );
      });
    },
    [candidates, postingDateFilter, sourceFilter, statusFilter],
  );

  const loadCandidates = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`${API_URL}/reports/candidates`);
      if (!response.ok) {
        throw new Error('Kaydedilen adaylar alınamadı.');
      }
      setCandidates((await response.json()) as SavedCandidate[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Adaylar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const handleSaveCandidate = async () => {
    if (!editingCandidate) return;
    try {
      setSaving(true);
      const response = await authenticatedFetch(
        `${API_URL}/businesses/${editingCandidate.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCandidate.name,
            address: editingCandidate.address ?? '',
            phone: editingCandidate.phone || undefined,
            status: editingCandidate.status,
            notes: editingCandidate.notes ?? '',
          }),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? 'Aday güncellenemedi.');
      }
      setEditingCandidate(null);
      await loadCandidates();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Aday güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCandidate = async (candidate: SavedCandidate) => {
    if (!window.confirm(`“${candidate.name}” adayını silmek istiyor musunuz?`)) return;
    const response = await authenticatedFetch(`${API_URL}/businesses/${candidate.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? 'Aday silinemedi.');
      return;
    }
    await loadCandidates();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      const token = getAccessToken();
      const response = await fetch(
        `${API_URL}/reports/businesses/excel`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Rapor oluşturulamadı. HTTP ${response.status}`,
        );
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = getDownloadFileName(response);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : 'Rapor indirilirken bir hata oluştu.',
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Raporlar
      </Typography>

      <Typography
        sx={{ mt: 1, color: 'text.secondary' }}
      >
        Satış adaylarına ait raporları buradan oluşturabilir ve
        indirebilirsiniz.
      </Typography>

      <Paper
        variant="outlined"
        sx={{ mt: 3, p: 4, borderRadius: 3 }}
      >
        <Stack
          spacing={1.5}
          sx={{
            py: 4,
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <AssessmentOutlinedIcon
            color="primary"
            sx={{ fontSize: 52 }}
          />

          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Excel raporları
          </Typography>

          <Typography color="text.secondary">
            Aday Keşfi sayfasında kaydettiğiniz işletmeleri Excel
            dosyası olarak indirin.
          </Typography>

          <Button
            variant="contained"
            size="large"
            disabled={downloading}
            startIcon={
              downloading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DownloadOutlinedIcon />
              )
            }
            onClick={() => void handleDownload()}
          >
            {downloading
              ? 'Rapor hazırlanıyor...'
              : 'Excel raporunu indir'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ mt: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Kaydedilen adaylar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Yükleniyor...'
              : statusFilter === 'ALL' &&
                  sourceFilter === 'ALL' &&
                  postingDateFilter === 'ALL'
                ? `${candidates.length} aday`
                : `${filteredCandidates.length} aday gösteriliyor · Toplam ${candidates.length}`}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 2 }}
          >
            <TextField
              select
              size="small"
              label="Duruma göre listele"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">Tüm durumlar</MenuItem>
              {statusOptions.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Kaynağa göre listele"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">Tüm kaynaklar</MenuItem>
              {sourceOptions.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="İlan tarihine göre listele"
              value={postingDateFilter}
              onChange={(event) =>
                setPostingDateFilter(event.target.value as PostingDateFilter)
              }
              sx={{ minWidth: 220 }}
            >
              {postingDateFilterOptions.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>İşletme</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Kaynak</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İlan tarihi</TableCell>
                <TableCell>Kaydetme tarihi</TableCell>
                <TableCell>Not</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{candidate.name}</TableCell>
                  <TableCell>{candidate.address ?? '-'}</TableCell>
                  <TableCell>{candidate.phone ?? '-'}</TableCell>
                  <TableCell>{candidate.discoverySource ?? '-'}</TableCell>
                  <TableCell>{getStatusLabel(candidate.status)}</TableCell>
                  <TableCell>{formatDate(candidate.postingDate)}</TableCell>
                  <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>{candidate.notes || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        disabled={!hasPermission('BUSINESS_UPDATE')}
                        onClick={() => setEditingCandidate({ ...candidate })}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!hasPermission('BUSINESS_DELETE')}
                        onClick={() => void handleDeleteCandidate(candidate)}
                      >
                        Sil
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredCandidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    Bu durumda kayıtlı aday bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={Boolean(editingCandidate)}
        onClose={saving ? undefined : () => setEditingCandidate(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Adayı düzenle</DialogTitle>
        <DialogContent>
          {editingCandidate && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="İşletme adı"
                value={editingCandidate.name}
                onChange={(event) =>
                  setEditingCandidate({ ...editingCandidate, name: event.target.value })
                }
              />
              <TextField
                label="Adres"
                value={editingCandidate.address ?? ''}
                onChange={(event) =>
                  setEditingCandidate({ ...editingCandidate, address: event.target.value })
                }
              />
              <TextField
                label="Telefon"
                value={editingCandidate.phone ?? ''}
                onChange={(event) =>
                  setEditingCandidate({ ...editingCandidate, phone: event.target.value })
                }
              />
              <TextField
                select
                label="Durum"
                value={editingCandidate.status}
                onChange={(event) =>
                  setEditingCandidate({ ...editingCandidate, status: event.target.value })
                }
              >
                {statusOptions.map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Görüşme ve takip notu"
                multiline
                minRows={4}
                value={editingCandidate.notes ?? ''}
                onChange={(event) =>
                  setEditingCandidate({ ...editingCandidate, notes: event.target.value })
                }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setEditingCandidate(null)}>
            İptal
          </Button>
          <Button
            variant="contained"
            disabled={saving || !editingCandidate?.name.trim()}
            onClick={() => void handleSaveCandidate()}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
