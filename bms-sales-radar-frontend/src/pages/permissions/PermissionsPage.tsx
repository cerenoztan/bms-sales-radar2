import * as React from 'react';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SourceOutlinedIcon from '@mui/icons-material/SourceOutlined';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

type RoleCode =
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP';

interface Role {
  id: number;
  name: string;
  code: RoleCode;
  description: string;
}

interface Permission {
  code: string;
  label: string;
}

interface PermissionGroup {
  module: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

type RolePermissions = Record<RoleCode, string[]>;

const roles: Role[] = [
  {
    id: 1,
    name: 'Yönetici',
    code: 'ADMIN',
    description: 'Sistemdeki tüm işlemlere erişebilir.',
  },
  {
    id: 2,
    name: 'Satış Müdürü',
    code: 'SALES_MANAGER',
    description:
      'Satış ekibini, işletmeleri ve raporları yönetebilir.',
  },
  {
    id: 3,
    name: 'Satış Temsilcisi',
    code: 'SALES_REP',
    description:
      'Kendisine açık satış ve işletme kayıtlarını görüntüler.',
  },
];

const permissionGroups: PermissionGroup[] = [
  {
    module: 'Dashboard',
    description: 'Ana gösterge paneli erişimi',
    icon: <DashboardOutlinedIcon />,
    permissions: [
      {
        code: 'DASHBOARD_VIEW',
        label: 'Dashboard görüntüleme',
      },
    ],
  },
  {
    module: 'İşletmeler',
    description: 'İşletme kayıtlarını yönetme izinleri',
    icon: <BusinessOutlinedIcon />,
    permissions: [
      {
        code: 'BUSINESS_VIEW',
        label: 'İşletmeleri görüntüleme',
      },
      {
        code: 'BUSINESS_CREATE',
        label: 'Yeni işletme oluşturma',
      },
      {
        code: 'BUSINESS_UPDATE',
        label: 'İşletme güncelleme',
      },
      {
        code: 'BUSINESS_DELETE',
        label: 'İşletme silme',
      },
    ],
  },
  {
    module: 'Kaynaklar',
    description: 'Kaynak URL ve kayıt yönetimi',
    icon: <SourceOutlinedIcon />,
    permissions: [
      {
        code: 'SOURCE_VIEW',
        label: 'Kaynakları görüntüleme',
      },
      {
        code: 'SOURCE_CREATE',
        label: 'Kaynak oluşturma',
      },
      {
        code: 'SOURCE_UPDATE',
        label: 'Kaynak güncelleme',
      },
      {
        code: 'SOURCE_DELETE',
        label: 'Kaynak silme',
      },
    ],
  },
  {
    module: 'Crawler',
    description: 'Tarama işlemleri ve sonuçları',
    icon: <RadarOutlinedIcon />,
    permissions: [
      {
        code: 'CRAWLER_VIEW',
        label: 'Crawler sonuçlarını görüntüleme',
      },
      {
        code: 'CRAWLER_RUN',
        label: 'Crawler çalıştırma',
      },
    ],
  },
  {
    module: 'Raporlar',
    description: 'Rapor görüntüleme ve dışa aktarma',
    icon: <AssessmentOutlinedIcon />,
    permissions: [
      {
        code: 'REPORT_VIEW',
        label: 'Raporları görüntüleme',
      },
      {
        code: 'REPORT_EXPORT_EXCEL',
        label: 'Excel raporu indirme',
      },
      {
        code: 'REPORT_EXPORT_PDF',
        label: 'PDF raporu indirme',
      },
    ],
  },
  {
    module: 'Kullanıcılar',
    description: 'Kullanıcı hesaplarını yönetme',
    icon: <PeopleAltOutlinedIcon />,
    permissions: [
      {
        code: 'USER_VIEW',
        label: 'Kullanıcıları görüntüleme',
      },
      {
        code: 'USER_CREATE',
        label: 'Kullanıcı oluşturma',
      },
      {
        code: 'USER_UPDATE',
        label: 'Kullanıcı güncelleme',
      },
      {
        code: 'USER_DELETE',
        label: 'Kullanıcı silme',
      },
    ],
  },
  {
    module: 'Roller',
    description: 'Rol tanımlama işlemleri',
    icon: <ManageAccountsOutlinedIcon />,
    permissions: [
      {
        code: 'ROLE_VIEW',
        label: 'Rolleri görüntüleme',
      },
      {
        code: 'ROLE_CREATE',
        label: 'Rol oluşturma',
      },
      {
        code: 'ROLE_UPDATE',
        label: 'Rol güncelleme',
      },
      {
        code: 'ROLE_DELETE',
        label: 'Rol silme',
      },
    ],
  },
  {
    module: 'Yetkilendirme',
    description: 'Rol izinlerini düzenleme',
    icon: <AdminPanelSettingsOutlinedIcon />,
    permissions: [
      {
        code: 'PERMISSION_VIEW',
        label: 'Yetkilendirmeyi görüntüleme',
      },
      {
        code: 'PERMISSION_UPDATE',
        label: 'Yetkilendirmeyi güncelleme',
      },
    ],
  },
];

const allPermissionCodes =
  permissionGroups.flatMap((group) =>
    group.permissions.map(
      (permission) => permission.code,
    ),
  );

const initialRolePermissions: RolePermissions = {
  ADMIN: allPermissionCodes,
  SALES_MANAGER: [
    'DASHBOARD_VIEW',

    'BUSINESS_VIEW',
    'BUSINESS_CREATE',
    'BUSINESS_UPDATE',

    'SOURCE_VIEW',
    'SOURCE_CREATE',
    'SOURCE_UPDATE',

    'CRAWLER_VIEW',
    'CRAWLER_RUN',

    'REPORT_VIEW',
    'REPORT_EXPORT_EXCEL',
    'REPORT_EXPORT_PDF',

    'USER_VIEW',

    'ROLE_VIEW',
  ],
  SALES_REP: [
    'DASHBOARD_VIEW',
    'BUSINESS_VIEW',
    'SOURCE_VIEW',
    'REPORT_VIEW',
  ],
};

export default function PermissionsPage() {
  const [selectedRoleCode, setSelectedRoleCode] =
    React.useState<RoleCode>('ADMIN');

  const [savedPermissions, setSavedPermissions] =
    React.useState<RolePermissions>(
      initialRolePermissions,
    );

  const [draftPermissions, setDraftPermissions] =
    React.useState<string[]>(
      initialRolePermissions.ADMIN,
    );

  const [snackbarOpen, setSnackbarOpen] =
    React.useState(false);

  const selectedRole =
    roles.find(
      (role) => role.code === selectedRoleCode,
    ) ?? roles[0];

  const isAdmin =
    selectedRoleCode === 'ADMIN';

  const hasChanges =
    JSON.stringify(
      [...draftPermissions].sort(),
    ) !==
    JSON.stringify(
      [
        ...savedPermissions[
          selectedRoleCode
        ],
      ].sort(),
    );

  const handleRoleSelect = (
    roleCode: RoleCode,
  ) => {
    setSelectedRoleCode(roleCode);
    setDraftPermissions(
      savedPermissions[roleCode],
    );
  };

  const handlePermissionChange = (
    permissionCode: string,
  ) => {
    if (isAdmin) {
      return;
    }

    setDraftPermissions((current) => {
      const exists =
        current.includes(permissionCode);

      if (exists) {
        return current.filter(
          (code) => code !== permissionCode,
        );
      }

      return [...current, permissionCode];
    });
  };

  const handleGroupChange = (
    group: PermissionGroup,
    checked: boolean,
  ) => {
    if (isAdmin) {
      return;
    }

    const groupCodes =
      group.permissions.map(
        (permission) => permission.code,
      );

    setDraftPermissions((current) => {
      if (checked) {
        return Array.from(
          new Set([
            ...current,
            ...groupCodes,
          ]),
        );
      }

      return current.filter(
        (code) =>
          !groupCodes.includes(code),
      );
    });
  };

  const handleSave = () => {
    setSavedPermissions((current) => ({
      ...current,
      [selectedRoleCode]: draftPermissions,
    }));

    setSnackbarOpen(true);
  };

  const handleReset = () => {
    setDraftPermissions(
      savedPermissions[selectedRoleCode],
    );
  };

  return (
    <Box>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Yetkilendirme
          </Typography>

          <Typography
            sx={{ color: 'text.secondary' }}
          >
            Roller için modül ve işlem izinlerini
            yönetin.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Değişiklikleri Geri Al
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSave}
            disabled={!hasChanges || isAdmin}
          >
            Yetkileri Kaydet
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '320px minmax(0, 1fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Roller
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.5,
              }}
            >
              Yetkilerini düzenlemek istediğiniz
              rolü seçin.
            </Typography>
          </Box>

          <Divider />

          <List
            disablePadding
            sx={{ p: 1 }}
          >
            {roles.map((role) => {
              const selected =
                role.code ===
                selectedRoleCode;

              return (
                <ListItemButton
                  key={role.code}
                  selected={selected}
                  onClick={() =>
                    handleRoleSelect(
                      role.code,
                    )
                  }
                  sx={{
                    mb: 0.75,
                    borderRadius: 2,
                    alignItems: 'flex-start',

                    '&.Mui-selected': {
                      bgcolor:
                        'primary.main',
                      color:
                        'primary.contrastText',

                      '&:hover': {
                        bgcolor:
                          'primary.dark',
                      },

                      '& .MuiListItemText-secondary':
                        {
                          color:
                            'rgba(255, 255, 255, 0.75)',
                        },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems:
                            'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {role.name}
                        </Typography>

                        <Chip
                          label={role.code}
                          size="small"
                          variant={
                            selected
                              ? 'filled'
                              : 'outlined'
                          }
                          sx={
                            selected
                              ? {
                                  bgcolor:
                                    'rgba(255,255,255,0.16)',
                                  color:
                                    'inherit',
                                }
                              : undefined
                          }
                        />
                      </Stack>
                    }
                    secondary={
                      role.description
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>

        <Stack spacing={2}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 3 }}
          >
            <CardContent>
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                sx={{
                  justifyContent:
                    'space-between',
                  alignItems: {
                    xs: 'flex-start',
                    sm: 'center',
                  },
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      mb: 0.75,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {selectedRole.name}
                    </Typography>

                    <Chip
                      label={
                        selectedRole.code
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    {
                      selectedRole.description
                    }
                  </Typography>
                </Box>

                <Chip
                  label={`${draftPermissions.length} yetki seçili`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              {isAdmin && (
                <Alert
                  severity="info"
                  sx={{ mt: 2 }}
                >
                  Yönetici rolü sistemdeki tüm
                  yetkilere sahiptir. Bu rolün
                  izinleri değiştirilemez.
                </Alert>
              )}
            </CardContent>
          </Card>

          {permissionGroups.map(
            (group) => {
              const groupCodes =
                group.permissions.map(
                  (permission) =>
                    permission.code,
                );

              const selectedCount =
                groupCodes.filter(
                  (code) =>
                    draftPermissions.includes(
                      code,
                    ),
                ).length;

              const allSelected =
                selectedCount ===
                groupCodes.length;

              const partiallySelected =
                selectedCount > 0 &&
                !allSelected;

              return (
                <Card
                  key={group.module}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      spacing={2}
                      sx={{
                        justifyContent:
                          'space-between',
                        alignItems: {
                          xs: 'flex-start',
                          sm: 'center',
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            borderRadius: 2,
                            bgcolor:
                              'primary.50',
                            color:
                              'primary.main',
                          }}
                        >
                          {group.icon}
                        </Box>

                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {group.module}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                'text.secondary',
                            }}
                          >
                            {
                              group.description
                            }
                          </Typography>
                        </Box>
                      </Stack>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              allSelected
                            }
                            disabled={isAdmin}
                            onChange={(
                              event,
                            ) =>
                              handleGroupChange(
                                group,
                                event.target
                                  .checked,
                              )
                            }
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked':
                                {
                                  color:
                                    partiallySelected
                                      ? 'warning.main'
                                      : undefined,
                                },
                            }}
                          />
                        }
                        label="Tümünü seç"
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1,
                      }}
                    >
                      {group.permissions.map(
                        (permission) => (
                          <FormControlLabel
                            key={
                              permission.code
                            }
                            disabled={
                              isAdmin
                            }
                            control={
                              <Checkbox
                                checked={draftPermissions.includes(
                                  permission.code,
                                )}
                                onChange={() =>
                                  handlePermissionChange(
                                    permission.code,
                                  )
                                }
                              />
                            }
                            label={
                              permission.label
                            }
                            sx={{
                              m: 0,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1.5,

                              '&:hover': {
                                bgcolor:
                                  'action.hover',
                              },
                            }}
                          />
                        ),
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            },
          )}
        </Stack>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbarOpen(false)
        }
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setSnackbarOpen(false)
          }
        >
          {selectedRole.name} rolünün yetkileri
          kaydedildi.
        </Alert>
      </Snackbar>
    </Box>
  );
}