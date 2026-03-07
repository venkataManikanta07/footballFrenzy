import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Typography, Paper, Box } from '@mui/material';

export default function SeasonsPage() {
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Seasons
        </Typography>
        <Box>
          <Typography>Seasons management UI placeholder. We'll implement forms and lists here.</Typography>
        </Box>
      </Paper>
    </AdminLayout>
  );
}
