import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  TextField,
  CircularProgress,
  Avatar,
  Fade,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { DataGrid } from '@mui/x-data-grid';

export default function UserPanel({ user, token, onLogout }) {
  const [docs, setDocs] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const timerRef = useRef();

  // Belgeleri backend'den çek
  const fetchDocs = async () => {
    setLoading(true);
    setError('');
    try {
      const realToken = token || localStorage.getItem('jwt_token');
      const res = await axios.get(`/api/documents?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${realToken}`
        }
      });
      setDocs(res.data);
    } catch (err) {
      setError(err.response?.data || 'Belgeler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // Otomatik güncelleme (her 10 saniyede bir)
    timerRef.current = setInterval(fetchDocs, 10000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('userId', user.id);
    try {
      const realToken = token || localStorage.getItem('jwt_token');
      await axios.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${realToken}`
        }
      });
      setSuccess('Belge başarıyla yüklendi');
      setFile(null);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data || 'Belge yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDocs();
    setSuccess('Belgeler güncellendi');
    setTimeout(() => setSuccess(''), 2000);
  };

  // DataGrid için kolonlar
  const columns = [
    { field: 'name', headerName: 'Belge Adı', flex: 1 },
    { field: 'status', headerName: 'Durum', flex: 1, renderCell: (params) => (
      params.value === 'Onay Bekliyor' ? <span style={{color:'#fbc02d', fontWeight:600}}>Beklemede</span> :
      params.value === 'Onaylandı' ? <span style={{color:'#388e3c', fontWeight:600}}>Onaylandı</span> :
      <span style={{color:'#d32f2f', fontWeight:600}}>Reddedildi</span>
    ) },
    { field: 'hash', headerName: 'Hash', flex: 2, minWidth: 120, renderCell: (params) => <Tooltip title={params.value}><span style={{fontFamily:'monospace', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:120, display:'inline-block'}}>{params.value}</span></Tooltip> },
    { field: 'date', headerName: 'Tarih', flex: 1, renderCell: (params) => {
        const value = params.value;
        if (!value) return '';
        try {
          const d = new Date(value);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth()+1).padStart(2,'0');
          const dd = String(d.getDate()).padStart(2,'0');
          const hh = String(d.getHours()).padStart(2,'0');
          const min = String(d.getMinutes()).padStart(2,'0');
          return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        } catch {
          return value;
        }
      }
    },
  ];

  // Güvenli dizi kullanımı
  const safeDocs = Array.isArray(docs) ? docs : [];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 6, p: {xs:1, sm:2} }}>
      <Fade in timeout={700}>
        <Card sx={{ mb: 3, borderRadius: 5, boxShadow: 8, p: {xs:1, sm:3}, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <CardContent>
            <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{xs:'flex-start',sm:'center'}} spacing={2} mb={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 32 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary.main">Hoşgeldin, {user.name}!</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Rol: {user.role}</Typography>
                </Box>
              </Stack>
              <Button onClick={onLogout} variant="outlined" color="error" startIcon={<LogoutIcon />} sx={{ fontWeight: 700, fontSize: 16 }}>Çıkış Yap</Button>
            </Stack>
            <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: {xs:'column',sm:'row'}, gap: 2, mb: 2, alignItems:'center' }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                color="primary"
                sx={{ minWidth: 140, fontWeight: 700, fontSize: 16, py:1.2 }}
              >
                Dosya Seç
                <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading || !file}
                sx={{ minWidth: 120, fontWeight: 700, fontSize: 16, py:1.2 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Yükle'}
              </Button>
              <Button
                type="button"
                onClick={handleRefresh}
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                sx={{ minWidth: 120, fontWeight: 700, fontSize: 16, py:1.2 }}
              >
                Yenile
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Typography variant="subtitle1" fontWeight={700} mb={1} mt={2}>Yüklenen Belgeler</Typography>
            <Box sx={{ height: 420, width: '100%', background: '#fafafa', borderRadius: 2, boxShadow: 2 }}>
              <DataGrid
                rows={safeDocs.filter(doc => doc.status !== "GENESIS").map(doc => ({ ...doc, id: doc.id || doc.hash || doc.index, name: doc.name, timestamp: doc.timestamp }))}
                columns={columns}
                pageSize={6}
                rowsPerPageOptions={[6, 12, 24]}
                disableSelectionOnClick
                sx={{ border: 0, fontSize: 15, background: 'transparent' }}
                getRowClassName={(params) =>
                  params.row.status === 'Onaylandı' ? 'bg-green-50' :
                  params.row.status === 'Reddedildi' ? 'bg-red-50' : ''
                }
                localeText={{
                  noRowsLabel: 'Henüz belge yok',
                  loadingOverlayLabel: 'Yükleniyor...'
                }}
                loading={loading}
                getRowId={(row) => row.id || row.hash || row.index}
              />
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
} 