import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function PlayerPage() {
  const router = useRouter();
  const { user } = router.query;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <Paper sx={{ p: 4, width: 560, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Player Dashboard (POC)
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Welcome {user || 'Guest'} — this is a placeholder player page.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')}>Back to Login</Button>
      </Paper>
    </Box>
  );
}
