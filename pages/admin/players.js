import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

// Mock seasons and weeks
const seasons = [
  { id: '2023', label: '2023 Season' },
  { id: '2024', label: '2024 Season' },
];
const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

// Mock players dataset
const mockPlayers = [
  { playerId: 'p1', employeeNumber: '3413', firstName: 'Read', lastName: 'Drexel', email: 'read@example.com', badgeNumber: '101018', totalCorrectPicks: 173, totalGamesPicked: 39, scoreDifference: 39, seasonRanking: 1, seasonDates: 'Sep 5, 2019-Feb 2, 2020' },
  { playerId: 'p2', employeeNumber: '7898', firstName: 'James', lastName: 'Mercer', email: 'james@example.com', badgeNumber: '108047', totalCorrectPicks: 172, totalGamesPicked: 27, scoreDifference: 27, seasonRanking: 2, seasonDates: 'Sep 5, 2019-Feb 2, 2020' },
  { playerId: 'p3', employeeNumber: '5109', firstName: 'Lawrence', lastName: 'Lee', email: 'lawrence@example.com', badgeNumber: '103503', totalCorrectPicks: 171, totalGamesPicked: 96, scoreDifference: 96, seasonRanking: 3, seasonDates: 'Sep 5, 2019-Feb 2, 2020' },
  // add more players for pagination
  { playerId: 'p4', employeeNumber: '4281', firstName: 'Rasany', lastName: 'Mekdarasack', email: 'rasany@example.com', badgeNumber: '100064', totalCorrectPicks: 168, totalGamesPicked: 82, scoreDifference: 82, seasonRanking: 4, seasonDates: 'Sep 5, 2019-Feb 2, 2020' },
  { playerId: 'p5', employeeNumber: '9951', firstName: 'Cory', lastName: 'Loucks', email: 'cory@example.com', badgeNumber: '111355', totalCorrectPicks: 167, totalGamesPicked: 146, scoreDifference: 146, seasonRanking: 5, seasonDates: 'Sep 5, 2019-Feb 2, 2020' },
];

export default function PlayersPage() {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', employeeNumber: '', badgeNumber: '', email: '', totalCorrectPicks: 0, totalGamesPicked: 0, scoreDifference: 0, seasonRanking: 0, seasonDates: '' });
  const [season, setSeason] = useState(seasons[0].id);
  const [week, setWeek] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState('totalCorrectPicks');
  const [orderDir, setOrderDir] = useState('desc');

  // Simulate fetching data (server-side) with filters, sorting and pagination
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      let results = [...mockPlayers];
      // apply filters
      if (firstName.trim()) results = results.filter(r => r.firstName.toLowerCase().includes(firstName.toLowerCase()));
      if (lastName.trim()) results = results.filter(r => r.lastName.toLowerCase().includes(lastName.toLowerCase()));
      if (employeeNumber.trim()) results = results.filter(r => r.employeeNumber.includes(employeeNumber));

      // sorting
      results.sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av === bv) return 0;
        if (orderDir === 'desc') return bv > av ? 1 : -1;
        return av > bv ? 1 : -1;
      });

      setData(results);
      setLoading(false);
    }, 400); // small delay to show loader
  };

  useEffect(() => {
    fetchData();
  }, [season, week, firstName, lastName, employeeNumber, orderBy, orderDir]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrderDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setOrderBy(col);
      setOrderDir('desc');
    }
  };

  const paginated = useMemo(() => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [data, page, rowsPerPage]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewChange = (field) => (e) => {
    const value = e.target.value;
    setNewPlayer((p) => ({ ...p, [field]: value }));
  };

  const handleAddPlayer = () => {
    // Basic validation
    if (!newPlayer.firstName.trim() || !newPlayer.employeeNumber.trim()) {
      alert('First name and Employee# are required.');
      return;
    }
    const created = {
      playerId: `p-${Date.now()}`,
      employeeNumber: newPlayer.employeeNumber,
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      email: newPlayer.email,
      badgeNumber: newPlayer.badgeNumber,
      totalCorrectPicks: Number(newPlayer.totalCorrectPicks) || 0,
      totalGamesPicked: Number(newPlayer.totalGamesPicked) || 0,
      scoreDifference: Number(newPlayer.scoreDifference) || 0,
      seasonRanking: Number(newPlayer.seasonRanking) || 0,
      seasonDates: newPlayer.seasonDates || '',
    };
    setData((prev) => [created, ...prev]);
    setIsNewOpen(false);
    setNewPlayer({ firstName: '', lastName: '', employeeNumber: '', badgeNumber: '', email: '', totalCorrectPicks: 0, totalGamesPicked: 0, scoreDifference: 0, seasonRanking: 0, seasonDates: '' });
    setPage(0);
  };

  return (
    <AdminLayout>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color="primary">Football Frenzy Admin - Players</Typography>
          <Box>
            <Button sx={{ mr: 1 }} variant="outlined" onClick={() => setIsNewOpen(true)}>New Player</Button>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          </Box>
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={3}>
            <Select fullWidth value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasons.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <Select fullWidth value={week} onChange={(e) => setWeek(e.target.value)}>
              {weeks.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Employee#" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} />
          </Grid>
        </Grid>

        <Typography variant="caption" sx={{ fontWeight: 600 }}>NOTES:</Typography>

        <Box mt={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : data.length === 0 ? (
            <Box p={4}><Typography>No players found.</Typography></Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#bfe6e6' }}>
                    <TableCell onClick={() => handleSort('seasonRanking')} sx={{ cursor: 'pointer', fontWeight: 600 }}>Season Place</TableCell>
                    <TableCell onClick={() => handleSort('lastName')} sx={{ cursor: 'pointer', fontWeight: 600 }}>Player Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Employee / Badge</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Season Dates</TableCell>
                    <TableCell onClick={() => handleSort('totalCorrectPicks')} sx={{ cursor: 'pointer', fontWeight: 600 }}>Total Winning Games Picked</TableCell>
                    <TableCell onClick={() => handleSort('scoreDifference')} sx={{ cursor: 'pointer', fontWeight: 600 }}>Total Combined Score Difference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Season Ranking</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((p) => (
                    <TableRow key={p.playerId}>
                      <TableCell>{p.seasonRanking}</TableCell>
                      <TableCell>{p.firstName} {p.lastName}</TableCell>
                      <TableCell>{p.employeeNumber} / {p.badgeNumber}</TableCell>
                      <TableCell>{p.seasonDates}</TableCell>
                      <TableCell>{p.totalCorrectPicks}</TableCell>
                      <TableCell>{p.scoreDifference}</TableCell>
                      <TableCell>{p.seasonRanking}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <TablePagination
                  component="div"
                  count={data.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                />
              </Box>
            </>
          )}
        </Box>
      </Paper>
      {/* New Player dialog */}
      <Dialog open={isNewOpen} onClose={() => setIsNewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Player</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" value={newPlayer.firstName} onChange={handleNewChange('firstName')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" value={newPlayer.lastName} onChange={handleNewChange('lastName')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Employee#" value={newPlayer.employeeNumber} onChange={handleNewChange('employeeNumber')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Badge#" value={newPlayer.badgeNumber} onChange={handleNewChange('badgeNumber')} />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField fullWidth label="Email" value={newPlayer.email} onChange={handleNewChange('email')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Total Correct Picks" type="number" value={newPlayer.totalCorrectPicks} onChange={handleNewChange('totalCorrectPicks')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Total Games Picked" type="number" value={newPlayer.totalGamesPicked} onChange={handleNewChange('totalGamesPicked')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Score Difference" type="number" value={newPlayer.scoreDifference} onChange={handleNewChange('scoreDifference')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Season Ranking" type="number" value={newPlayer.seasonRanking} onChange={handleNewChange('seasonRanking')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Season Dates" value={newPlayer.seasonDates} onChange={handleNewChange('seasonDates')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPlayer}>Add Player</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

