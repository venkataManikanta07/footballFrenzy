import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Typography, Paper, Box } from '@mui/material';

export default function AdminsPage() {
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Admins
        </Typography>
        <Box>
          <Typography>Admin users management placeholder.</Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
}
