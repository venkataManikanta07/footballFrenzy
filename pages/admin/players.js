import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Typography, Paper, Box } from '@mui/material';

export default function PlayersPage() {
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Players
        </Typography>
        <Box>
          <Typography>Players listing and stats placeholder.</Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
}
