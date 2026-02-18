import React from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../lib/api';
import { safeStorage } from '../../lib/storage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const data = res.data as { token?: string };
      if (data?.token) {
        safeStorage.setItem('ga_token', data.token);
        navigate('/', { replace: true });
        if (typeof window !== 'undefined') window.location.reload();
      }
    } catch (err: unknown) {
      const ax = err as { message?: string; code?: string; response?: { data?: { message?: string } } };
      const msg = ax?.response?.data?.message;
      const isConnectionRefused = msg === 'Network Error' || ax?.message === 'Network Error' || ax?.code === 'ERR_NETWORK';
      setError(isConnectionRefused ? 'No se puede conectar al servidor. Iniciá el backend con: cd backend && npm run dev' : msg || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            GRUPO ALVAREZ EXCHANGE
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sign in to continue
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Usuario"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="grupoalvarez"
              required
              fullWidth
              size="small"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
            />
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
