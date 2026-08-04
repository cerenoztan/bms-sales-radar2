import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import RadarIcon from '@mui/icons-material/Radar';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 260;

const menuItems = [
  {
    label: 'Ana Sayfa',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Kullanıcılar',
    path: '/dashboard/users',
    icon: <PeopleIcon />,
  },
  {
    label: 'Rol Tanımlama',
    path: '/dashboard/roles',
    icon: <AdminPanelSettingsIcon />,
  },
  {
    label: "Yetkilendirme",
    path: '/dashboard/permissions',
    icon: <AdminPanelSettingsIcon/>,
  },
  {
    label: 'Raporlar',
    path: '/dashboard/reports',
    icon: <AssessmentIcon />,
  },
  {
    label: 'Ayarlar',
    path: '/dashboard/settings',
    icon: <SettingsIcon />,
  },

];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');

    navigate('/', {
      replace: true,
    });
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
          const selected =
            location.pathname === item.path;

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