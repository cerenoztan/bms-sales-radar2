import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  CssBaseline,
  TextField,
  Typography,
} from '@mui/material';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] =
    React.useState('');

  const [loading, setLoading] =
    React.useState(false);

  const [error, setError] =
    React.useState('');

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError('');

    if (!token) {
      setError('Geçersiz şifre sıfırlama bağlantısı.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            'Şifre değiştirilemedi.',
        );
      }

      alert(
        'Şifreniz başarıyla güncellendi.',
      );

      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Beklenmeyen bir hata oluştu.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          p: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 450,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            component="h1"
             variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
                }}
            >
                  Yeni Şifre
            </Typography>

          <Typography
            variant="body1"
             color="text.secondary"
             sx={{
           mb: 3,
             }}
                >
          Yeni şifrenizi belirleyin.
            </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Yeni Şifre"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <TextField
              label="Yeni Şifre Tekrar"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !token}
            >
              {loading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                'Şifreyi Güncelle'
              )}
            </Button>

            <Button
              onClick={() =>
                navigate('/login')
              }
            >
              Girişe Dön
            </Button>
          </Box>
        </Card>
      </Box>
    </>
  );
}
