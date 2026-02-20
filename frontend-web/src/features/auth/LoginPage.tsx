import React from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../lib/api';
import { safeStorage } from '../../lib/storage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Si ya está autenticado, redirigir al dashboard
  React.useEffect(() => {
    const token = safeStorage.getItem('ga_token');
    if (token) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validación básica
    if (!email.trim()) {
      setError('Ingresá tu usuario');
      return;
    }
    if (!password) {
      setError('Ingresá tu contraseña');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      const data = res.data as { token?: string };
      if (data?.token) {
        safeStorage.setItem('ga_token', data.token);
        const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError('No se recibió el token de autenticación');
      }
    } catch (err: unknown) {
      const ax = err as { message?: string; code?: string; response?: { data?: { message?: string }; status?: number } };
      const msg = ax?.response?.data?.message;
      const status = ax?.response?.status;
      const isConnectionRefused = msg === 'Network Error' || ax?.message === 'Network Error' || ax?.code === 'ERR_NETWORK';
      
      if (isConnectionRefused) {
        setError('No se puede conectar al servidor. Verificá que el backend esté corriendo: cd backend && npm run dev');
      } else if (status === 401) {
        setError('Usuario o contraseña incorrectos');
      } else if (status === 400) {
        setError(msg || 'Datos inválidos. Verificá usuario y contraseña');
      } else {
        setError(msg || 'Error al iniciar sesión. Intentá nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
              🏛️ GRUPO ALVAREZ
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              EXCHANGE SYSTEM
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Iniciar sesión para continuar
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Usuario"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="grupoalvarez"
              required
              fullWidth
              size="medium"
              autoFocus
              disabled={loading}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="elterribleusd1"
              required
              fullWidth
              size="medium"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSubmit(e as any);
                }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              size="large"
              sx={{ 
                mt: 1,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Ingresando…
                </Box>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Credenciales de prueba:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Usuario: grupoalvarez
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Contraseña: elterribleusd1
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
