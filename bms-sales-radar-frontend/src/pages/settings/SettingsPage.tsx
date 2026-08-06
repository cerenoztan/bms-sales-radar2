import * as React from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  authenticatedFetch,
  getStoredUser,
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

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [password, setPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
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
    </Box>
  );
}
