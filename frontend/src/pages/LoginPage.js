import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  IconButton,
  Stack,
  InputAdornment,
  Fade
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const roles = [
  { value: 'user', label: 'Kullanıcı' },
  { value: 'noter', label: 'Noter' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        await axios.post('/api/auth/register', {
          name, email, password, role
        });
        setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setIsRegister(false);
      } else {
        const res = await axios.post('/api/auth/login', {
          email, password
        });
        onLogin && onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #f8bbd0 100%)' }}>
      <Fade in timeout={700}>
        <Card sx={{ minWidth: 350, maxWidth: 410, p: 3, borderRadius: 5, boxShadow: 8, backdropFilter: 'blur(2px)' }}>
          <CardContent>
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1} mb={2}>
              <Box sx={{ mb: 1 }}>
                {isRegister ? <PersonAddAlt1Icon color="primary" sx={{ fontSize: 48 }} /> : <LoginIcon color="primary" sx={{ fontSize: 48 }} />}
              </Box>
              <Typography variant="h4" fontWeight={800} color="primary.main" letterSpacing={1} mb={0.5}>
                {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={1}>
                Noter Onaylı Belge Doğrulama Sistemi
              </Typography>
            </Stack>
            <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isRegister && (
                <TextField label="Ad Soyad" required value={name} onChange={e => setName(e.target.value)} autoFocus />
              )}
              {isRegister && (
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Rol</InputLabel>
                  <Select
                    labelId="role-label"
                    value={role}
                    label="Rol"
                    onChange={e => setRole(e.target.value)}
                  >
                    {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              <TextField label="E-posta" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
              <TextField
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {error && <Alert severity="error">{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ fontWeight: 700, letterSpacing: 1, py: 1.5, mt: 1, boxShadow: 3, fontSize: 18 }}
                fullWidth
              >
                {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
              </Button>
              <Button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                color="secondary"
                sx={{ textTransform: 'none', fontWeight: 500, fontSize: 16 }}
              >
                {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
} 