import Box from '@mui/material/Box';

import Sidebar from './Sidebar';
import BusinessGrid from './BusinessGrid';

export default function Dashboard() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'grey.50',
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <BusinessGrid />
      </Box>
    </Box>
  );
}