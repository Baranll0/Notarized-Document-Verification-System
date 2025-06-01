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
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Fade,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import { DataGrid } from '@mui/x-data-grid';

export default function NoterPanel({ user, token, onLogout }) {
  const [docs, setDocs] = useState([]);
  const [myDecisions, setMyDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('pending');
  const timerRef = useRef();

  const fetchDocs = () => {
    setLoading(true);
    setError('');
    axios.get(`/api/documents/blocks/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setDocs(res.data.filter(doc => doc.documentStatus === "Onay Bekliyor")))
      .catch(() => setError('Belgeler alınamadı'))
      .finally(() => setLoading(false));
  };

  const fetchMyDecisions = () => {
    setLoading(true);
    setError('');
    axios.get(`/api/documents/my-decisions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMyDecisions(res.data))
      .catch(() => setError('Geçmiş kararlar alınamadı'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    console.log('NoterPanel user:', user);
    if (tab === 'pending') fetchDocs();
    if (tab === 'history') fetchMyDecisions();
    timerRef.current = setInterval(() => {
      if (tab === 'pending') fetchDocs();
      if (tab === 'history') fetchMyDecisions();
    }, 10000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [token, tab]);

  const handleApprove = async (id, approved) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const realToken = token || localStorage.getItem('jwt_token');
      await axios.post(`/api/documents/approve?id=${id}&approved=${approved}`, {}, {
        headers: { Authorization: `Bearer ${realToken}` }
      });
      setSuccess(approved ? 'Belge onaylandı.' : 'Belge reddedildi.');
      fetchDocs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('İşlem başarısız');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (tab === 'pending') fetchDocs();
    if (tab === 'history') fetchMyDecisions();
    setSuccess('Liste güncellendi');
    setTimeout(() => setSuccess(''), 2000);
  };

  // DataGrid kolonları
  const pendingColumns = [
    { field: 'documentName', headerName: 'Ad', flex: 1 },
    { field: 'documentHash', headerName: 'Hash', flex: 2, minWidth: 120, renderCell: (params) => <Tooltip title={params.value}><span style={{fontFamily:'monospace', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:120, display:'inline-block'}}>{params.value}</span></Tooltip> },
    { field: 'documentDate', headerName: 'Tarih', flex: 1, renderCell: (params) => {
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
    { field: 'actions', headerName: 'İşlem', flex: 1, sortable: false, renderCell: (params) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleApprove(params.row.documentId, true)}
        >
          Onayla
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<CancelIcon />}
          onClick={() => handleApprove(params.row.documentId, false)}
        >
          Reddet
        </Button>
      </Stack>
    ) },
  ];

  const historyColumns = [
    { field: 'name', headerName: 'Ad', flex: 1 },
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
    { field: 'status', headerName: 'Durum', flex: 1, renderCell: (params) => (
      params.value === 'Onay Bekliyor' ? <span style={{color:'#fbc02d', fontWeight:600}}>Onay Bekliyor</span> :
      params.value === 'Onaylandı' ? <span style={{color:'#388e3c', fontWeight:600}}>Onaylandı</span> :
      <span style={{color:'#d32f2f', fontWeight:600}}>Reddedildi</span>
    ) },
  ];

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 6, p: {xs:1, sm:2} }}>
      <Fade in timeout={700}>
        <Card sx={{ mb: 3, borderRadius: 5, boxShadow: 8, p: {xs:1, sm:3}, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <CardContent>
            <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{xs:'flex-start',sm:'center'}} spacing={2} mb={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 32 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary.main">Noter Paneli</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Rol: noter</Typography>
                </Box>
              </Stack>
              <Button onClick={onLogout} variant="outlined" color="error" startIcon={<LogoutIcon />} sx={{ fontWeight: 700, fontSize: 16 }}>Çıkış Yap</Button>
            </Stack>
            <Stack direction="row" spacing={2} mb={2}>
              <Tabs value={tab} onChange={(_,v)=>setTab(v)} textColor="primary" indicatorColor="primary">
                <Tab value="pending" label="Onay Bekleyenler" />
                <Tab value="history" label="Geçmiş Kararlarım" />
              </Tabs>
              <Button onClick={handleRefresh} variant="outlined" color="primary" startIcon={<RefreshIcon />} sx={{ fontWeight: 700, fontSize: 16 }}>Yenile</Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box sx={{ height: 440, width: '100%', background: '#fafafa', borderRadius: 2, boxShadow: 2 }}>
              <DataGrid
                rows={(tab==='pending' ? docs : myDecisions).map(doc => ({ ...doc, id: doc.documentId || doc.id }))}
                columns={tab==='pending'?pendingColumns:historyColumns}
                pageSize={7}
                rowsPerPageOptions={[7, 14, 28]}
                disableSelectionOnClick
                sx={{ border: 0, fontSize: 15, background: 'transparent' }}
                localeText={{
                  noRowsLabel: tab==='pending' ? 'Onay bekleyen belge yok' : 'Geçmiş karar yok',
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