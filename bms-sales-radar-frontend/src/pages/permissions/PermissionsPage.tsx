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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

interface Role {
  id: number;
  name: string;
  isActive: boolean;
}

interface Permission {
  id: number;
  name: string;
  key: string;
}

interface PermissionGroup {
  module: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(' ')
        : data?.message ??
          `İstek başarısız oldu. HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

function getGroupDefinition(
  permissionKey: string,
): {
  module: string;
  description: string;
  icon: React.ReactNode;
} {
  if (permissionKey.startsWith('DASHBOARD_')) {
    return {
      module: 'Dashboard',
      description: 'Ana gösterge paneli erişimi',
      icon: <DashboardOutlinedIcon />,
    };
  }
  if (
  permissionKey.startsWith(
    'SEARCH_DISCOVERY_',
  )
  ) {
  return {
    module: 'Aday Keşfi',
    description:
      'Google araması ve aday keşfi erişimi',
    icon: <SearchOutlinedIcon />,
  };
  }

  if (permissionKey.startsWith('BUSINESS_')) {
    return {
      module: 'İşletmeler',
      description: 'İşletme kayıtlarını yönetme izinleri',
      icon: <BusinessOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('SOURCE_')) {
    return {
      module: 'Kaynaklar',
      description: 'Kaynak URL ve kayıt yönetimi',
      icon: <SourceOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('CRAWLER_')) {
    return {
      module: 'Crawler',
      description: 'Tarama işlemleri ve sonuçları',
      icon: <RadarOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('REPORT_')) {
    return {
      module: 'Raporlar',
      description: 'Rapor görüntüleme ve dışa aktarma',
      icon: <AssessmentOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('USER_')) {
    return {
      module: 'Kullanıcılar',
      description: 'Kullanıcı hesaplarını yönetme',
      icon: <PeopleAltOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('ROLE_')) {
    return {
      module: 'Roller',
      description: 'Rol tanımlama işlemleri',
      icon: <ManageAccountsOutlinedIcon />,
    };
  }

  if (permissionKey.startsWith('PERMISSION_')) {
    return {
      module: 'Yetkilendirme',
      description: 'Rol izinlerini düzenleme',
      icon: <AdminPanelSettingsOutlinedIcon />,
    };
  }

  return {
    module: 'Diğer',
    description: 'Diğer sistem izinleri',
    icon: <AdminPanelSettingsOutlinedIcon />,
  };
}

function groupPermissions(
  permissions: Permission[],
): PermissionGroup[] {
  const groups = new Map<
    string,
    PermissionGroup
  >();

  for (const permission of permissions) {
    const definition =
      getGroupDefinition(permission.key);

    const existing =
      groups.get(definition.module);

    if (existing) {
      existing.permissions.push(permission);
      continue;
    }

    groups.set(definition.module, {
      ...definition,
      permissions: [permission],
    });
  }

  return Array.from(groups.values());
}

export default function PermissionsPage() {
  const [roles, setRoles] =
    React.useState<Role[]>([]);

  const [permissions, setPermissions] =
    React.useState<Permission[]>([]);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = React.useState<number | null>(null);

  const [
    savedPermissionIds,
    setSavedPermissionIds,
  ] = React.useState<number[]>([]);

  const [
    draftPermissionIds,
    setDraftPermissionIds,
  ] = React.useState<number[]>([]);

  const [loading, setLoading] =
    React.useState(true);

  const [
    rolePermissionsLoading,
    setRolePermissionsLoading,
  ] = React.useState(false);

  const [saving, setSaving] =
    React.useState(false);

  const [pageError, setPageError] =
    React.useState('');

  const [snackbar, setSnackbar] =
    React.useState<SnackbarState>({
      open: false,
      message: '',
      severity: 'success',
    });

  const permissionGroups =
    React.useMemo(
      () => groupPermissions(permissions),
      [permissions],
    );

  const selectedRole =
    roles.find(
      (role) => role.id === selectedRoleId,
    ) ?? null;

  const hasChanges =
    JSON.stringify(
      [...draftPermissionIds].sort(
        (a, b) => a - b,
      ),
    ) !==
    JSON.stringify(
      [...savedPermissionIds].sort(
        (a, b) => a - b,
      ),
    );

  const loadInitialData =
    React.useCallback(async () => {
      try {
        setLoading(true);
        setPageError('');

        const [
          rolesResponse,
          permissionsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/roles`),
          fetch(`${API_URL}/permissions`),
        ]);

        const loadedRoles =
          await readResponse<Role[]>(
            rolesResponse,
          );

        const loadedPermissions =
          await readResponse<Permission[]>(
            permissionsResponse,
          );

        setRoles(loadedRoles);
        setPermissions(
          loadedPermissions,
        );

        setSelectedRoleId((current) => {
          if (
            current !== null &&
            loadedRoles.some(
              (role) =>
                role.id === current,
            )
          ) {
            return current;
          }

          return (
            loadedRoles[0]?.id ?? null
          );
        });
      } catch (error) {
        setPageError(
          error instanceof Error
            ? error.message
            : 'Yetkilendirme verileri yüklenemedi.',
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const loadRolePermissions =
    React.useCallback(
      async (roleId: number) => {
        try {
          setRolePermissionsLoading(true);
          setPageError('');

          const response = await fetch(
            `${API_URL}/roles/${roleId}/permissions`,
          );

          const rolePermissions =
            await readResponse<Permission[]>(
              response,
            );

          const permissionIds =
            rolePermissions.map(
              (permission) =>
                permission.id,
            );

          setSavedPermissionIds(
            permissionIds,
          );

          setDraftPermissionIds(
            permissionIds,
          );
        } catch (error) {
          setPageError(
            error instanceof Error
              ? error.message
              : 'Rol yetkileri yüklenemedi.',
          );
        } finally {
          setRolePermissionsLoading(
            false,
          );
        }
      },
      [],
    );

  React.useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  React.useEffect(() => {
    if (selectedRoleId === null) {
      setSavedPermissionIds([]);
      setDraftPermissionIds([]);
      return;
    }

    void loadRolePermissions(
      selectedRoleId,
    );
  }, [
    selectedRoleId,
    loadRolePermissions,
  ]);

  const handleRoleSelect = (
    roleId: number,
  ) => {
    if (
      saving ||
      rolePermissionsLoading
    ) {
      return;
    }

    setSelectedRoleId(roleId);
  };

  const handlePermissionChange = (
    permissionId: number,
  ) => {
    setDraftPermissionIds(
      (current) => {
        const exists =
          current.includes(
            permissionId,
          );

        if (exists) {
          return current.filter(
            (id) =>
              id !== permissionId,
          );
        }

        return [
          ...current,
          permissionId,
        ];
      },
    );
  };

  const handleGroupChange = (
    group: PermissionGroup,
    checked: boolean,
  ) => {
    const groupPermissionIds =
      group.permissions.map(
        (permission) =>
          permission.id,
      );

    setDraftPermissionIds(
      (current) => {
        if (checked) {
          return Array.from(
            new Set([
              ...current,
              ...groupPermissionIds,
            ]),
          );
        }

        return current.filter(
          (id) =>
            !groupPermissionIds.includes(
              id,
            ),
        );
      },
    );
  };

  const handleReset = () => {
    setDraftPermissionIds(
      savedPermissionIds,
    );
  };

  const handleSave = async () => {
    if (selectedRoleId === null) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/roles/${selectedRoleId}/permissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            permissionIds:
              draftPermissionIds,
          }),
        },
      );

      await readResponse<Role>(
        response,
      );

      setSavedPermissionIds(
        draftPermissionIds,
      );

      setSnackbar({
        open: true,
        message:
          `${selectedRole?.name ?? 'Rol'} yetkileri kaydedildi.`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Yetkiler kaydedilemedi.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Stack
        sx={{
          minHeight: 400,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

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
          justifyContent:
            'space-between',
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
            sx={{
              fontWeight: 700,
            }}
          >
            Yetkilendirme
          </Typography>

          <Typography
            color="text.secondary"
          >
            Backend’de kayıtlı rollerin
            yetkilerini yönetin.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
        >
        

          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={
              !hasChanges || saving
            }
          >
            Değişiklikleri Geri Al
          </Button>

          <Button
            variant="contained"
            startIcon={
              <SaveOutlinedIcon />
            }
            onClick={() =>
              void handleSave()
            }
            disabled={
              selectedRoleId === null ||
              !hasChanges ||
              saving ||
              rolePermissionsLoading
            }
          >
            {saving
              ? 'Kaydediliyor...'
              : 'Yetkileri Kaydet'}
          </Button>
        </Stack>
      </Stack>

      {pageError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {pageError}
        </Alert>
      )}

      {roles.length === 0 ? (
        <Alert severity="info">
          Henüz rol tanımlanmamış.
          Önce Rol Tanımlama sayfasından
          bir rol oluşturun.
        </Alert>
      ) : (
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
                sx={{
                  fontWeight: 700,
                }}
              >
                Roller
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Yetkilerini düzenlemek
                istediğiniz rolü seçin.
              </Typography>
            </Box>

            <Divider />

            <List
              disablePadding
              sx={{ p: 1 }}
            >
              {roles.map((role) => {
                const selected =
                  role.id ===
                  selectedRoleId;

                return (
                  <ListItemButton
                    key={role.id}
                    selected={selected}
                    disabled={
                      !role.isActive
                    }
                    onClick={() =>
                      handleRoleSelect(
                        role.id,
                      )
                    }
                    sx={{
                      mb: 0.75,
                      borderRadius: 2,

                      '&.Mui-selected': {
                        bgcolor:
                          'primary.main',
                        color:
                          'primary.contrastText',

                        '&:hover': {
                          bgcolor:
                            'primary.dark',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {role.name}
                        </Typography>
                      }
                      secondary={
                        role.isActive
                          ? 'Aktif rol'
                          : 'Pasif rol'
                      }
                      slotProps={{
                        secondary: {
                          sx: selected
                            ? {
                                color:
                                  'rgba(255,255,255,0.75)',
                              }
                            : undefined,
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>

          <Stack spacing={2}>
            <Card
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
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {selectedRole?.name ??
                        'Rol seçilmedi'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Yeni roller başlangıçta
                      sıfır yetkiye sahiptir.
                    </Typography>
                  </Box>

                  <Chip
                    label={`${draftPermissionIds.length} yetki seçili`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>

            {rolePermissionsLoading ? (
              <Stack
                sx={{
                  minHeight: 250,
                  alignItems: 'center',
                  justifyContent:
                    'center',
                }}
              >
                <CircularProgress />
              </Stack>
            ) : permissions.length === 0 ? (
              <Alert severity="warning">
                Henüz yetki seçeneği
                oluşturulmamış. Yukarıdaki
                “Yetki Seçeneklerini Oluştur”
                butonuna basın.
              </Alert>
            ) : (
              permissionGroups.map(
                (group) => {
                  const groupIds =
                    group.permissions.map(
                      (permission) =>
                        permission.id,
                    );

                  const selectedCount =
                    groupIds.filter(
                      (id) =>
                        draftPermissionIds.includes(
                          id,
                        ),
                    ).length;

                  const allSelected =
                    selectedCount ===
                    groupIds.length;

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
                              alignItems:
                                'center',
                            }}
                          >
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                borderRadius: 2,
                                bgcolor:
                                  'action.hover',
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
                                color="text.secondary"
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
                                disabled={
                                  selectedRoleId ===
                                  null
                                }
                                onChange={(
                                  event,
                                ) =>
                                  handleGroupChange(
                                    group,
                                    event.target
                                      .checked,
                                  )
                                }
                              />
                            }
                            label="Tümünü seç"
                          />
                        </Stack>

                        <Divider
                          sx={{ my: 2 }}
                        />

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns:
                              {
                                xs: '1fr',
                                sm: 'repeat(2, minmax(0, 1fr))',
                              },
                            gap: 1,
                          }}
                        >
                          {group.permissions.map(
                            (
                              permission,
                            ) => (
                              <FormControlLabel
                                key={
                                  permission.id
                                }
                                control={
                                  <Checkbox
                                    checked={draftPermissionIds.includes(
                                      permission.id,
                                    )}
                                    onChange={() =>
                                      handlePermissionChange(
                                        permission.id,
                                      )
                                    }
                                  />
                                }
                                label={
                                  permission.name
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
              )
            )}
          </Stack>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((current) => ({
              ...current,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}