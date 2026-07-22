import { useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import SourceIcon from '@mui/icons-material/TravelExplore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import RadarIcon from '@mui/icons-material/Radar';

const drawerWidth = 260;

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'İşletmeler',
    path: '/dashboard/businesses',
    icon: <BusinessIcon />,
  },
  {
    label: 'Kaynaklar',
    path: '/dashboard/sources',
    icon: <SourceIcon />,
  },
  {
    label: 'Raporlar',
    path: '/dashboard/reports',
    icon: <AssessmentIcon />,
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <RadarIcon />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            BMS Sales Radar
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary' }}
          >
            Satış yönetimi
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 0.75,
                borderRadius: 2,

                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',

                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },

                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: selected
                    ? 'primary.contrastText'
                    : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      <List sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: 'error.main',
            }}
          >
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText primary="Çıkış yap" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}