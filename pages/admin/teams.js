import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Typography, Paper, Box } from '@mui/material';

export default function TeamsPage() {
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Teams
        </Typography>
        <Box>
          <Typography>Teams management UI placeholder.</Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
}
