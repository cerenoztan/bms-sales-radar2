import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import CreateRoleDialog from './CreateRoleDialog';

interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const roles: Role[] = [
  {
    id: 1,
    name: 'Yönetici',
    code: 'ADMIN',
    description: 'Sistemdeki tüm işlemlere erişebilir.',
    isActive: true,
  },
  {
    id: 2,
    name: 'Satış Müdürü',
    code: 'SALES_MANAGER',
    description:
      'Satış ekibini ve satış kayıtlarını yönetebilir.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Satış Temsilcisi',
    code: 'SALES_REP',
    description:
      'Kendi satış kayıtlarını görüntüleyebilir.',
    isActive: true,
  },
];

export default function RolesPage() {

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box
      sx={{
        p: 3,
      }}
    >
      {/* Sayfa başlığı */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Rol Tanımlama
          </Typography>

          <Typography
            sx={{
              color: 'text.secondary',
            }}
          >
            Sistemde kullanılacak rolleri yönetin.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}        >
          Yeni Rol
        </Button>
      </Box>

      {/* Rol kartları */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {roles.map((role) => (
          <Card
            key={role.id}
            variant="outlined"
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                {/* Rol bilgileri */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {role.name}
                    </Typography>

                    <Chip
                      label={role.code}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={
                        role.isActive
                          ? 'Aktif'
                          : 'Pasif'
                      }
                      size="small"
                      color={
                        role.isActive
                          ? 'success'
                          : 'default'
                      }
                    />
                  </Box>

                  <Typography
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {role.description}
                  </Typography>
                </Box>

                {/* İşlem butonları */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexShrink: 0,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                  >
                    Düzenle
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={role.code === 'ADMIN'}
                  >
                    Sil
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      <CreateRoleDialog
         open={createOpen}
        onClose={() => setCreateOpen(false)}
            />
    </Box>
    
  );
  
}