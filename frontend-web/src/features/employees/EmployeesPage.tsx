import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import {
  createUser,
  fetchUsers,
  updateUserActive
} from '../../lib/api';
import type { UserItem } from '../../lib/api';

export const EmployeesPage: React.FC = () => {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', password: '', role: 'teller' as const });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message || err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Completá nombre, email y contraseña');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });
      setForm({ name: '', email: '', password: '', role: 'teller' });
      await load();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message || err?.message || 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateUserActive(id, isActive);
      await load();
    } catch (e) {
      console.error('Error updating user', e);
      setError('Error al actualizar estado del usuario');
    }
  };

  const columns: GridColDef<UserItem>[] = [
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'role', headerName: 'Rol', width: 100 },
    {
      field: 'isActive',
      headerName: 'Activo',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.row.isActive}
          onChange={(e) => handleToggleActive(params.row._id, e.target.checked)}
          color="primary"
        />
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <Typography variant="h5" fontWeight={600}>
        Employee management
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Crear usuario
              </Typography>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Nombre"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Contraseña"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    fullWidth
                    required
                  />
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={form.role}
                      label="Rol"
                      onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as 'admin' | 'manager' | 'teller' }))}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="teller">Cajero</MenuItem>
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="contained" disabled={submitting}>
                    {submitting ? 'Creando…' : 'Crear usuario'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Usuarios
              </Typography>
              {loading ? (
                <Skeleton height={200} />
              ) : (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={users.map((u) => ({ ...u, id: u._id }))}
                    columns={columns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    slots={{
                      toolbar: () => (
                        <GridToolbarContainer>
                          <GridToolbarQuickFilter debounceMs={300} />
                        </GridToolbarContainer>
                      )
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
