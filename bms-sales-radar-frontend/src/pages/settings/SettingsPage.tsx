import * as React from 'react';

import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  authenticatedFetch,
  getStoredUser,
  hasPermission,
} from '../../auth/authStorage';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface Profile {
  id: number;
  fullName: string;
  email: string;
  jobTitle?: string | null;
  role: { id: number; name: string } | null;
}

interface SearchKeyword {
  id: number;
  keyword: string;
  isActive: boolean;
  isDefault: boolean;
}

interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  hasPassword: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [password, setPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [keywords, setKeywords] = React.useState<SearchKeyword[]>([]);
  const [keywordInput, setKeywordInput] = React.useState('');
  const [addingKeyword, setAddingKeyword] = React.useState(false);
  const [keywordsLoading, setKeywordsLoading] = React.useState(true);
  const [updatingKeywordId, setUpdatingKeywordId] =
    React.useState<number | null>(null);
  const [deletingKeywordId, setDeletingKeywordId] =
    React.useState<number | null>(null);
  const [smtp, setSmtp] = React.useState<SmtpSettings | null>(null);
  const [smtpPassword, setSmtpPassword] = React.useState('');
  const [smtpLoading, setSmtpLoading] = React.useState(false);
  const [smtpSaving, setSmtpSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{
    severity: 'success' | 'error';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    void authenticatedFetch(`${API_URL}/auth/me`)
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.message ?? 'Profil bilgileri alınamadı.');
        }
        setProfile(body as Profile);
      })
      .catch((error) => {
        setMessage({
          severity: 'error',
          text: error instanceof Error ? error.message : 'Profil yüklenemedi.',
        });
      });
  }, []);

  const canManageKeywords = hasPermission('SEARCH_DISCOVERY_VIEW');
  const canManageSettings = hasPermission('SETTINGS_MANAGE');

  React.useEffect(() => {
    if (!canManageSettings) return;
    setSmtpLoading(true);
    void authenticatedFetch(`${API_URL}/settings/smtp`)
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.message ?? 'SMTP ayarları alınamadı.');
        setSmtp(body as SmtpSettings);
      })
      .catch((error) => setMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'SMTP ayarları alınamadı.',
      }))
      .finally(() => setSmtpLoading(false));
  }, [canManageSettings]);

  React.useEffect(() => {
    if (!canManageKeywords) return;

    let cancelled = false;
    void authenticatedFetch(`${API_URL}/search-keywords`)
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.message ?? 'Anahtar kelimeler alınamadı.');
        }
        if (!cancelled) {
          setKeywords(
            (body as SearchKeyword[]).filter((keyword) => keyword.isDefault),
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage({
            severity: 'error',
            text: error instanceof Error ? error.message : 'Anahtar kelimeler alınamadı.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setKeywordsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canManageKeywords]);

  const toggleKeyword = async (keyword: SearchKeyword) => {
    try {
      setUpdatingKeywordId(keyword.id);
      setMessage(null);
      const response = await authenticatedFetch(
        `${API_URL}/search-keywords/${keyword.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !keyword.isActive }),
        },
      );
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message ?? 'Anahtar kelime güncellenemedi.');
      }

      setKeywords((current) =>
        current.map((item) => (item.id === keyword.id ? body as SearchKeyword : item)),
      );
      setMessage({
        severity: 'success',
        text: 'Varsayılan anahtar kelime listesi güncellendi.',
      });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Anahtar kelime güncellenemedi.',
      });
    } finally {
      setUpdatingKeywordId(null);
    }
  };

  const addDefaultKeyword = async () => {
    const keyword = keywordInput.trim();
    if (!keyword) return;

    try {
      setAddingKeyword(true);
      setMessage(null);
      const response = await authenticatedFetch(`${API_URL}/search-keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, isDefault: true }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(' ')
            : body?.message ?? 'Varsayılan anahtar kelime eklenemedi.',
        );
      }
      setKeywords((current) => [body as SearchKeyword, ...current]);
      setKeywordInput('');
      setMessage({ severity: 'success', text: 'Varsayılan anahtar kelime eklendi.' });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Varsayılan anahtar kelime eklenemedi.',
      });
    } finally {
      setAddingKeyword(false);
    }
  };

  const deleteDefaultKeyword = async (keyword: SearchKeyword) => {
    const confirmed = window.confirm(
      `“${keyword.keyword}” varsayılan anahtar kelimesini silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    try {
      setDeletingKeywordId(keyword.id);
      setMessage(null);
      const response = await authenticatedFetch(
        `${API_URL}/search-keywords/${keyword.id}/default`,
        { method: 'DELETE' },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message ?? 'Varsayılan anahtar kelime silinemedi.');
      }
      setKeywords((current) => current.filter((item) => item.id !== keyword.id));
      setMessage({ severity: 'success', text: 'Varsayılan anahtar kelime silindi.' });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Varsayılan anahtar kelime silinemedi.',
      });
    } finally {
      setDeletingKeywordId(null);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      setMessage(null);
      const response = await authenticatedFetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          email: profile.email.trim().toLowerCase(),
          jobTitle: profile.jobTitle?.trim() ?? '',
          ...(password ? { password } : {}),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(' ')
            : body?.message ?? 'Profil güncellenemedi.',
        );
      }

      const updatedProfile = body as Profile;
      setProfile(updatedProfile);
      setPassword('');

      const storedUser = getStoredUser();
      if (storedUser) {
        const storage = localStorage.getItem('accessToken')
          ? localStorage
          : sessionStorage;
        storage.setItem(
          'user',
          JSON.stringify({ ...storedUser, ...updatedProfile }),
        );
      }

      setMessage({ severity: 'success', text: 'Hesap bilgileri güncellendi.' });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Profil güncellenemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSmtp = async () => {
    if (!smtp) return;
    try {
      setSmtpSaving(true);
      setMessage(null);
      const response = await authenticatedFetch(`${API_URL}/settings/smtp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtp.host.trim(),
          username: smtp.username.trim(),
          fromName: smtp.fromName.trim(),
          ...(smtpPassword ? { password: smtpPassword } : {}),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(Array.isArray(body?.message) ? body.message.join(' ') : body?.message ?? 'SMTP ayarları kaydedilemedi.');
      }
      setSmtp(body as SmtpSettings);
      setSmtpPassword('');
      setMessage({ severity: 'success', text: 'SMTP ayarları kaydedildi.' });
    } catch (error) {
      setMessage({ severity: 'error', text: error instanceof Error ? error.message : 'SMTP ayarları kaydedilemedi.' });
    } finally {
      setSmtpSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        Hesabım
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Kişisel bilgilerinizi ve giriş şifrenizi yönetin.
      </Typography>

      <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 3 }}>
        {!profile ? (
          <Typography color="text.secondary">Profil yükleniyor...</Typography>
        ) : (
          <Stack spacing={2.5}>
            {message && <Alert severity={message.severity}>{message.text}</Alert>}
            <TextField
              label="Ad Soyad"
              value={profile.fullName}
              required
              onChange={(event) =>
                setProfile({ ...profile, fullName: event.target.value })
              }
            />
            <TextField
              label="E-posta"
              type="email"
              value={profile.email}
              required
              onChange={(event) =>
                setProfile({ ...profile, email: event.target.value })
              }
            />
            <TextField
              label="Görev / Unvan"
              value={profile.jobTitle ?? ''}
              onChange={(event) =>
                setProfile({ ...profile, jobTitle: event.target.value })
              }
            />
            <TextField
              label="Rol"
              value={profile.role?.name ?? 'Rol atanmadı'}
              disabled
            />
            <TextField
              label="Yeni şifre"
              type="password"
              value={password}
              helperText="Değiştirmek istemiyorsanız boş bırakın. En az 6 karakter."
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button
              variant="contained"
              disabled={
                saving ||
                !profile.fullName.trim() ||
                !profile.email.trim() ||
                (password.length > 0 && password.length < 6)
              }
              onClick={() => void handleSave()}
              sx={{ alignSelf: 'flex-start' }}
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri kaydet'}
            </Button>
          </Stack>
        )}
      </Paper>

      {canManageSettings && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                SMTP e-posta ayarları
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Şifre sıfırlama ve sistem e-postalarının gönderileceği hesabı yapılandırın.
              </Typography>
            </Box>
            <Divider />
            {smtpLoading || !smtp ? (
              <Typography color="text.secondary">SMTP ayarları yükleniyor...</Typography>
            ) : (
              <>
                <TextField label="SMTP sunucusu" placeholder="smtp.gmail.com" required value={smtp.host} onChange={(event) => setSmtp({ ...smtp, host: event.target.value })} />
                <TextField label="Kullanıcı adı / e-posta" type="email" required value={smtp.username} onChange={(event) => setSmtp({ ...smtp, username: event.target.value })} />
                <TextField
                  label="SMTP parolası / uygulama parolası"
                  type="password"
                  value={smtpPassword}
                  placeholder={smtp.hasPassword ? 'Kayıtlı parolayı korumak için boş bırakın' : ''}
                  helperText={smtp.hasPassword ? 'Bir parola kayıtlı. Yalnızca değiştirmek istiyorsanız yeni parolayı yazın.' : 'SMTP hesabının parolasını veya uygulama parolasını girin.'}
                  onChange={(event) => setSmtpPassword(event.target.value)}
                />
                <TextField label="Gönderen adı" required value={smtp.fromName} onChange={(event) => setSmtp({ ...smtp, fromName: event.target.value })} />
                <Button
                  variant="contained"
                  disabled={smtpSaving || !smtp.host.trim() || !smtp.username.trim() || !smtp.fromName.trim() || (!smtp.hasPassword && !smtpPassword)}
                  onClick={() => void saveSmtp()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {smtpSaving ? 'Kaydediliyor...' : 'SMTP ayarlarını kaydet'}
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {canManageKeywords && (
        <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Varsayılan anahtar kelimeler
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Aday Keşfi'nde hazır olarak gösterilecek kelimeleri seçin. Yeni
                kelimeleri Aday Keşfi ekranından ekleyebilirsiniz.
              </Typography>
            </Box>

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Yeni varsayılan anahtar kelime"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void addDefaultKeyword();
                }}
              />
              <Button
                variant="outlined"
                disabled={addingKeyword || !keywordInput.trim()}
                onClick={() => void addDefaultKeyword()}
              >
                {addingKeyword ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </Stack>

            {keywordsLoading ? (
              <Typography color="text.secondary">Anahtar kelimeler yükleniyor...</Typography>
            ) : keywords.length === 0 ? (
              <Typography color="text.secondary">
                Henüz anahtar kelime yok. İlk kelimeyi Aday Keşfi ekranından ekleyin.
              </Typography>
            ) : (
              <Stack spacing={0.5}>
                {keywords.map((keyword) => (
                  <Stack
                    key={keyword.id}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={keyword.isActive}
                          disabled={
                            updatingKeywordId === keyword.id ||
                            deletingKeywordId === keyword.id
                          }
                          onChange={() => void toggleKeyword(keyword)}
                        />
                      }
                      label={keyword.keyword}
                    />
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={deletingKeywordId === keyword.id}
                      onClick={() => void deleteDefaultKeyword(keyword)}
                    >
                      {deletingKeywordId === keyword.id ? 'Siliniyor...' : 'Sil'}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
