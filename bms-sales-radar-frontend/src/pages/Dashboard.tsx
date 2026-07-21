import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';

export default function Dashboard() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f7fb',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="h4" fontWeight={700} mb={1}>
          BMS Sales Radar
        </Typography>

        <Typography color="text.secondary" mb={4}>
          Haftalık Tablo 
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Toplam İşletme
                </Typography>

                <Typography variant="h4" fontWeight={700}>
                  128
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Yüksek Öncelik
                </Typography>

                <Typography variant="h4" fontWeight={700}>
                  34
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Aktif Kaynak
                </Typography>

                <Typography variant="h4" fontWeight={700}>
                  12
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Bu Hafta Bulunan
                </Typography>

                <Typography variant="h4" fontWeight={700}>
                  21
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}