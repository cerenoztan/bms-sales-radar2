import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import RadarIcon from '@mui/icons-material/Radar';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: '450px',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.94)',
  backdropFilter: 'blur(8px)',
  boxShadow:
    '0 5px 15px rgba(15, 23, 42, 0.15), 0 15px 35px rgba(15, 23, 42, 0.12)',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  padding: theme.spacing(2),
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage:
    "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/background.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',

  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

export default function SignIn() {
  const navigate = useNavigate();

  const [emailError, setEmailError] =
    React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] =
    React.useState('');

  const [passwordError, setPasswordError] =
    React.useState(false);
  const [
    passwordErrorMessage,
    setPasswordErrorMessage,
  ] = React.useState('');

  const [loginError, setLoginError] =
    React.useState('');

  const [isLoading, setIsLoading] =
    React.useState(false);

  const validateInputs = (
    email: string,
    password: string,
  ): boolean => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage(
        'Lütfen geçerli bir e-posta adresi girin.',
      );
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        'Şifre en az 6 karakter olmalıdır.',
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const email = String(
      formData.get('email') ?? '',
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get('password') ?? '',
    );

    const remember =
      formData.get('remember') === 'on';

    const isValid = validateInputs(
      email,
      password,
    );

    if (!isValid) {
      return;
    }

    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'http://localhost:3000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(' ')
            : data.message ||
                'Giriş sırasında bir hata oluştu.',
        );
      }

      const storage = remember
        ? localStorage
        : sessionStorage;

      storage.setItem(
        'accessToken',
        data.accessToken,
      );

      storage.setItem(
        'user',
        JSON.stringify(data.user),
      );

      navigate('/dashboard', {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Sunucuya bağlanılamadı.';

      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />

      <SignInContainer direction="column">
        <Card variant="outlined">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
              }}
            >
              <RadarIcon />
            </Box>

            <Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: 700 }}
              >
                BMS Sales Radar
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Satış yönetim platformu
              </Typography>
            </Box>
          </Box>

          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontSize:
                'clamp(2rem, 10vw, 2.15rem)',
            }}
          >
            Giriş yap
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">
                E-posta
              </FormLabel>

              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="ornek@bmsproje.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={
                  emailError
                    ? 'error'
                    : 'primary'
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">
                Şifre
              </FormLabel>

              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                id="password"
                type="password"
                name="password"
                placeholder="••••••"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={
                  passwordError
                    ? 'error'
                    : 'primary'
                }
              />
            </FormControl>

            {loginError && (
              <Typography
                role="alert"
                color="error"
                variant="body2"
              >
                {loginError}
              </Typography>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  color="primary"
                />
              }
              label="Beni hatırla"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isLoading
                ? 'Giriş yapılıyor...'
                : 'Giriş yap'}
            </Button>

            <Link
              component="button"
              type="button"
              variant="body2"
              sx={{ alignSelf: 'center' }}
              onClick={() => {
                alert(
                  'Şifre yenileme özelliği daha sonra eklenecek.',
                );
              }}
            >
              Şifrenizi mi unuttunuz?
            </Link>
          </Box>
        </Card>
      </SignInContainer>
    </>
  );
}