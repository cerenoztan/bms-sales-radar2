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
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ??
            'Şifre sıfırlama isteği gönderilemedi.',
        );
      }

      setMessage(
        'E-posta adresi sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.',
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
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
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 450,
            p: 4,
            borderRadius: 4,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
            }}
          >
            Şifremi unuttum
          </Typography>

          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 3,
            }}
          >
            Hesabınıza ait e-posta adresini girin.
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
            {message && (
              <Alert severity="success">
                {message}
              </Alert>
            )}

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              fullWidth
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                'Sıfırlama bağlantısı gönder'
              )}
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/login')}
            >
              Giriş ekranına dön
            </Button>
          </Box>
        </Card>
      </Box>
    </>
  );
}