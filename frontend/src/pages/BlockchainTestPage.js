import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Alert, Stack, CircularProgress } from '@mui/material';

export default function BlockchainTestPage({ token }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      // Test için benzersiz bir hash ve isim
      const testName = 'Test Belgesi ' + Date.now();
      const testHash = Math.random().toString(36).substring(2, 15);
      // Backend'e belge ekle
      const res = await axios.post('/api/documents', {
        name: testName,
        hash: testHash,
        metadata: 'blockchain test',
        categoryId: 1 // Varsayılan kategori, gerekirse değiştirin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Eklenen belgeyi hash ile tekrar çek
      const doc = res.data;
      setResult(doc);
    } catch (err) {
      setError(err.response?.data || 'Test başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, p: 2 }}>
      <Typography variant="h5" fontWeight={700} color="primary.main" mb={2}>
        Blockchain Bağlantı Testi
      </Typography>
      <Typography variant="body1" mb={2}>
        Bu sayfa, backend ve blockchain bağlantısının çalıştığını test etmek için kullanılır. Test butonuna tıkladığınızda zincire bir test belgesi eklenir ve sonucu ekranda görürsünüz.
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <Button onClick={handleTest} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Test Et'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'string' ? error : JSON.stringify(error)}</Alert>}
      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Test başarılı! Eklenen belge:<br />
          <pre style={{fontSize:13, margin:0}}>{JSON.stringify(result, null, 2)}</pre>
        </Alert>
      )}
    </Box>
  );
} 