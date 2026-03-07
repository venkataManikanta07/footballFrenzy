import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Typography, Paper, Box } from '@mui/material';

export default function WeeksPage() {
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Weeks
        </Typography>
        <Box>
          <Typography>Weeks scheduling UI placeholder.</Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
}
