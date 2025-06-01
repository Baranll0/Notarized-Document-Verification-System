import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Avatar,
  Fade,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000'];

export default function AdminPanel({ token, onLogout }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const timerRef = useRef();
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('blocks');
  const [testResult, setTestResult] = useState('');

  const fetchBlocks = () => {
    setLoading(true);
    setError('');
    axios.get('/api/documents/admin/blocks-with-details', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBlocks(res.data))
      .catch(() => setError('Veriler alınamadı'))
      .finally(() => setLoading(false));
  };

  const fetchTransactions = () => {
    setLoading(true);
    setError('');
    axios.get('/api/documents/admin/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTransactions(res.data))
      .catch(() => setError('Transactionlar alınamadı'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'blocks') fetchBlocks();
    if (tab === 'transactions') fetchTransactions();
    timerRef.current = setInterval(() => {
      if (tab === 'blocks') fetchBlocks();
      if (tab === 'transactions') fetchTransactions();
    }, 10000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [token, tab]);

  const handleRefresh = () => {
    fetchBlocks();
    setSuccess('Liste güncellendi');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSmartContractTest = async () => {
    setTestResult('');
    setError('');
    try {
      // Son eklenen belgeyi bul
      const docsRes = await axios.get('/api/documents/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docs = docsRes.data;
      if (!docs || docs.length === 0) {
        setTestResult('Test için uygun belge bulunamadı!');
        return;
      }
      // Son eklenen belgeyi seç
      const lastDoc = docs[docs.length - 1];
      // Admin olarak onaylamaya çalış
      await axios.post(`/api/documents/approve?id=${lastDoc.id}&approved=true`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestResult('Başarılı! (Bu beklenmiyordu, bir sorun var!)');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setTestResult('Yetkilendirme hatası: Sadece noterler onay/red işlemi yapabilir!');
        } else if (typeof err.response.data === 'string') {
          setTestResult(err.response.data);
        } else {
          setTestResult(JSON.stringify(err.response.data));
        }
      } else {
        setTestResult('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      }
    }
  };

  // Kolonları otomatik oluştur
  const columns = [
    { field: 'id', headerName: 'Blok ID', minWidth: 80 },
    { field: 'status', headerName: 'Blok Durumu', minWidth: 120 },
    {
      field: 'detay',
      headerName: 'Detay',
      minWidth: 100,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => { setSelectedBlock(params.row); setDetailOpen(true); }}>
          <InfoIcon />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const transactionColumns = [
    { field: 'id', headerName: 'ID', minWidth: 60 },
    { field: 'name', headerName: 'Belge Adı', minWidth: 120 },
    { field: 'hash', headerName: 'Hash', minWidth: 180, renderCell: (params) => <Tooltip title={params.value}><span style={{fontFamily:'monospace', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:120, display:'inline-block'}}>{params.value}</span></Tooltip> },
    { field: 'status', headerName: 'Durum', minWidth: 110, renderCell: (params) => (
      params.value === 'Onay Bekliyor' ? <span style={{color:'#fbc02d', fontWeight:600}}>Onay Bekliyor</span> :
      params.value === 'Onaylandı' ? <span style={{color:'#388e3c', fontWeight:600}}>Onaylandı</span> :
      <span style={{color:'#d32f2f', fontWeight:600}}>Reddedildi</span>
    ) },
    { field: 'date', headerName: 'Tarih', minWidth: 140, renderCell: (params) => {
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
    { field: 'user', headerName: 'Kullanıcı', minWidth: 120, valueGetter: (params) => (params && params.row && params.row.user && params.row.user.name) ? params.row.user.name : '' },
    { field: 'noter', headerName: 'Noter', minWidth: 120, valueGetter: (params) => (params && params.row && params.row.noter && params.row.noter.name) ? params.row.noter.name : '' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #232526 0%, #414345 100%)',
      py: 6,
      px: { xs: 0, sm: 2 },
    }}>
      <Fade in timeout={700}>
        <Card sx={{
          mb: 3,
          borderRadius: 6,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          p: { xs: 1, sm: 3 },
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.18)',
          maxWidth: 1250,
          mx: 'auto',
        }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 32, boxShadow: 3 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={900} color="#fff" letterSpacing={1} sx={{ textShadow: '0 2px 8px #0008' }}>Admin Paneli</Typography>
                  <Typography variant="body2" color="#e0e0e0" fontWeight={600}>Rol: admin</Typography>
                </Box>
              </Stack>
              <Button onClick={onLogout} variant="outlined" color="error" startIcon={<LogoutIcon />} sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, px: 3, bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', borderColor: '#fff3' }}>
                Çıkış Yap
              </Button>
            </Stack>
            <Stack direction="row" spacing={2} mb={2}>
              <Button onClick={() => setTab('blocks')} variant={tab === 'blocks' ? 'contained' : 'outlined'} sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, bgcolor: tab === 'blocks' ? 'primary.main' : 'rgba(255,255,255,0.07)', color: tab === 'blocks' ? '#fff' : '#e0e0e0', borderColor: '#fff3' }}>Bloklar</Button>
              <Button onClick={() => setTab('transactions')} variant={tab === 'transactions' ? 'contained' : 'outlined'} sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, bgcolor: tab === 'transactions' ? 'secondary.main' : 'rgba(255,255,255,0.07)', color: tab === 'transactions' ? '#fff' : '#e0e0e0', borderColor: '#fff3' }}>Tüm Transactionlar</Button>
              <Button onClick={handleRefresh} variant="outlined" color="primary" startIcon={<RefreshIcon />} sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', borderColor: '#fff3' }}>Yenile</Button>
              <Button onClick={handleSmartContractTest} variant="outlined" color="secondary" sx={{ fontWeight: 700, fontSize: 16, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', borderColor: '#fff3' }}>Smart Contract Test</Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {testResult && <Alert severity={testResult.includes('noter') || testResult.includes('Yetkilendirme') ? 'success' : 'error'} sx={{ mb: 2 }}>{testResult}</Alert>}
            {tab === 'blocks' && <>
              <Typography variant="subtitle1" fontWeight={700} mb={1} mt={2} color="#fff">Tüm Bloklar</Typography>
              <Box sx={{ height: 600, width: '100%', background: 'rgba(0,0,0,0.25)', borderRadius: 3, boxShadow: 2 }}>
                <DataGrid
                  rows={blocks.map(block => ({ ...block, id: block.id }))}
                  columns={columns}
                  pageSize={12}
                  rowsPerPageOptions={[12, 24, 48]}
                  disableSelectionOnClick
                  sx={{ border: 0, fontSize: 15, background: 'transparent', color: '#fff',
                    '& .MuiDataGrid-cell': { color: '#fff', borderColor: '#fff2', fontWeight: 500 },
                    '& .MuiDataGrid-columnHeaders': { background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 16 },
                    '& .MuiDataGrid-footerContainer': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
                    '& .MuiDataGrid-row': { background: 'rgba(255,255,255,0.03)' },
                    '& .MuiDataGrid-row:hover': { background: 'rgba(255,255,255,0.10)' },
                  }}
                  localeText={{
                    noRowsLabel: 'Kayıt yok',
                    loadingOverlayLabel: 'Yükleniyor...'
                  }}
                  loading={loading}
                />
              </Box>
              <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontSize: 22, color: 'primary.main', background: 'linear-gradient(90deg,#f5f7fa,#c3cfe2)', mb: 0 }}>
                  Blok Detayları (ID: {selectedBlock?.id})
                </DialogTitle>
                <DialogContent sx={{ background: 'rgba(245,247,250,0.95)', borderRadius: 3, p: 3 }}>
                  <pre style={{ fontSize: 14, background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                    {selectedBlock ? JSON.stringify(selectedBlock, null, 2) : ''}
                  </pre>
                </DialogContent>
              </Dialog>
            </>}
            {tab === 'transactions' && <>
              <Typography variant="subtitle1" fontWeight={700} mb={1} mt={2} color="#fff">Tüm Transactionlar</Typography>
              <Box sx={{ height: 600, width: '100%', background: 'rgba(0,0,0,0.25)', borderRadius: 3, boxShadow: 2 }}>
                <DataGrid
                  rows={transactions.map(tr => ({ ...tr, id: tr.id }))}
                  columns={transactionColumns}
                  pageSize={12}
                  rowsPerPageOptions={[12, 24, 48]}
                  disableSelectionOnClick
                  sx={{ border: 0, fontSize: 15, background: 'transparent', color: '#fff',
                    '& .MuiDataGrid-cell': { color: '#fff', borderColor: '#fff2', fontWeight: 500 },
                    '& .MuiDataGrid-columnHeaders': { background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 16 },
                    '& .MuiDataGrid-footerContainer': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
                    '& .MuiDataGrid-row': { background: 'rgba(255,255,255,0.03)' },
                    '& .MuiDataGrid-row:hover': { background: 'rgba(255,255,255,0.10)' },
                  }}
                  localeText={{
                    noRowsLabel: 'Kayıt yok',
                    loadingOverlayLabel: 'Yükleniyor...'
                  }}
                  loading={loading}
                />
              </Box>
            </>}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
} 