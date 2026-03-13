import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Paper, Typography, Grid, TextField, Select, MenuItem, Button, Box,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, FormControl, InputLabel, Stack,
} from '@mui/material';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon    from '@mui/icons-material/Add';
import {
  LS_SEASONS, LS_WEEKS, LS_GAMES, LS_PLAYERS, LS_PICKS,
  loadLS, saveLS, formatDate,
  INITIAL_SEASONS, INITIAL_WEEKS, INITIAL_GAMES, INITIAL_PLAYERS,
} from '../../mock/store';

const TH = { backgroundColor: '#bfe6e6', color: '#064e4e', fontWeight: 700 };

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const emptyPlayer = { firstName: '', lastName: '', employeeNumber: '', badgeNumber: '', email: '', password: '' };

export default function PlayersPage() {
  const [seasons,  setSeasons]  = useState([]);
  const [weeks,    setWeeks]    = useState([]);
  const [games,    setGames]    = useState([]);
  const [players,  setPlayers]  = useState([]);
  const [picks,    setPicks]    = useState([]);

  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedWeek,   setSelectedWeek]   = useState('all');
  const [pickType,       setPickType]       = useState('best');
  const [searchLast,     setSearchLast]     = useState('');
  const [searchFirst,    setSearchFirst]    = useState('');
  const [searchEmp,      setSearchEmp]      = useState('');
  const [searchBadge,    setSearchBadge]    = useState('');
  // applied on Search click
  const [appliedLast,    setAppliedLast]    = useState('');
  const [appliedFirst,   setAppliedFirst]   = useState('');
  const [appliedEmp,     setAppliedEmp]     = useState('');
  const [appliedBadge,   setAppliedBadge]   = useState('');

  const [page,        setPage]        = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // New / Edit player dialog
  const [playerDialog,  setPlayerDialog]  = useState(false);
  const [playerForm,    setPlayerForm]    = useState(emptyPlayer);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formErrors,    setFormErrors]    = useState({});

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  // ─── Seed / Load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const s = loadLS(LS_SEASONS, INITIAL_SEASONS);
    const w = loadLS(LS_WEEKS,   INITIAL_WEEKS);
    const g = loadLS(LS_GAMES,   INITIAL_GAMES);
    const p = loadLS(LS_PLAYERS, INITIAL_PLAYERS);
    const pk = loadLS(LS_PICKS,  []);
    setSeasons(s);
    setWeeks(w);
    setGames(g);
    setPlayers(p);
    setPicks(pk);
    const active = s.find(x => x.status === 'active') || s[0];
    setSelectedSeason(active ? active.seasonId : '');
  }, []);

  // Weeks for selected season
  const seasonWeeks = useMemo(
    () => weeks.filter(w => w.seasonId === selectedSeason).sort((a, b) => a.weekNumber - b.weekNumber),
    [weeks, selectedSeason],
  );

  // Games in scope (season + optional week filter)
  const scopedGames = useMemo(() => {
    const weekIds = new Set(seasonWeeks.map(w => w.weekId));
    const base = games.filter(g => weekIds.has(g.weekId));
    if (selectedWeek === 'all') return base;
    return base.filter(g => g.weekId === selectedWeek);
  }, [games, seasonWeeks, selectedWeek]);

  // Leaderboard computation
  const leaderboard = useMemo(() => {
    const scopedGameIds = new Set(scopedGames.map(g => g.gameId));
    const winnerMap = Object.fromEntries(scopedGames.map(g => [g.gameId, g.winnerTeamId]));

    const selectedSeason_ = seasons.find(s => s.seasonId === selectedSeason);
    const seasonDates = selectedSeason_
      ? `${formatDate(selectedSeason_.startDate)} – ${formatDate(selectedSeason_.endDate)}`
      : '';

    const rows = players.map(pl => {
      const plPicks = picks.filter(pk => pk.playerId === pl.playerId && scopedGameIds.has(pk.gameId));
      const totalPicked  = plPicks.length;
      const correctPicks = plPicks.filter(pk => pk.teamId && pk.teamId === winnerMap[pk.gameId]).length;
      return { ...pl, totalPicked, correctPicks, seasonDates };
    });

    rows.sort((a, b) => b.correctPicks - a.correctPicks || a.lastName.localeCompare(b.lastName));
    return rows.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [players, picks, scopedGames, seasons, selectedSeason]);

  // Apply search filters (applied on Search click)
  const filtered = useMemo(() => leaderboard.filter(r => {
    if (appliedFirst && !r.firstName.toLowerCase().includes(appliedFirst.toLowerCase())) return false;
    if (appliedLast  && !r.lastName.toLowerCase().includes(appliedLast.toLowerCase()))  return false;
    if (appliedEmp   && !r.employeeNumber.includes(appliedEmp))   return false;
    if (appliedBadge && !r.badgeNumber?.includes(appliedBadge))   return false;
    return true;
  }), [leaderboard, appliedFirst, appliedLast, appliedEmp, appliedBadge]);

  function applySearch() {
    setAppliedLast(searchLast);
    setAppliedFirst(searchFirst);
    setAppliedEmp(searchEmp);
    setAppliedBadge(searchBadge);
    setPage(0);
  }

  function clearAll() {
    setSearchLast(''); setSearchFirst(''); setSearchEmp(''); setSearchBadge('');
    setAppliedLast(''); setAppliedFirst(''); setAppliedEmp(''); setAppliedBadge('');
    setPage(0);
  }

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  // ─── Player CRUD ───────────────────────────────────────────────────────────
  function openNewPlayer() {
    setPlayerForm(emptyPlayer);
    setEditingPlayer(null);
    setFormErrors({});
    setPlayerDialog(true);
  }

  function openEditPlayer(player) {
    setPlayerForm({
      firstName:      player.firstName,
      lastName:       player.lastName,
      employeeNumber: player.employeeNumber,
      badgeNumber:    player.badgeNumber,
      email:          player.email,
      password:       player.password || '',
    });
    setEditingPlayer(player);
    setFormErrors({});
    setPlayerDialog(true);
  }

  function validatePlayer() {
    const e = {};
    if (!playerForm.firstName.trim())      e.firstName      = 'Required';
    if (!playerForm.employeeNumber.trim()) e.employeeNumber = 'Required';
    if (!playerForm.password.trim())       e.password       = 'Required';
    return e;
  }

  function savePlayer() {
    const e = validatePlayer();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    let updated;
    if (editingPlayer) {
      updated = players.map(p =>
        p.playerId === editingPlayer.playerId ? { ...p, ...playerForm } : p,
      );
    } else {
      updated = [...players, {
        playerId:       `p${Date.now()}`,
        firstName:      playerForm.firstName,
        lastName:       playerForm.lastName,
        employeeNumber: playerForm.employeeNumber,
        badgeNumber:    playerForm.badgeNumber,
        email:          playerForm.email,
        password:       playerForm.password,
      }];
    }
    saveLS(LS_PLAYERS, updated);
    setPlayers(updated);
    setPlayerDialog(false);
  }

  function confirmDelete(player) { setPlayerToDelete(player); setDeleteDialog(true); }

  function deletePlayer() {
    const updated = players.filter(p => p.playerId !== playerToDelete.playerId);
    const updatedPicks = picks.filter(pk => pk.playerId !== playerToDelete.playerId);
    saveLS(LS_PLAYERS, updated);
    saveLS(LS_PICKS, updatedPicks);
    setPlayers(updated);
    setPicks(updatedPicks);
    setDeleteDialog(false);
    setPlayerToDelete(null);
  }

  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#064e4e' }}>Players</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewPlayer}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}
          >
            New Player
          </Button>
        </Box>

        {/* Filters row 1: dropdowns */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 180 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Season</Typography>
            <FormControl fullWidth size="small">
              <Select value={selectedSeason} onChange={e => { setSelectedSeason(e.target.value); setSelectedWeek('all'); setPage(0); }}>
                {seasons.map(s => <MenuItem key={s.seasonId} value={s.seasonId}>{s.seasonName}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Week Number</Typography>
            <FormControl fullWidth size="small">
              <Select value={selectedWeek} onChange={e => { setSelectedWeek(e.target.value); setPage(0); }}>
                <MenuItem value="all">All</MenuItem>
                {seasonWeeks.map(w => <MenuItem key={w.weekId} value={w.weekId}>{w.weekNumber}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 140 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Pick Type</Typography>
            <FormControl fullWidth size="small">
              <Select value={pickType} onChange={e => setPickType(e.target.value)}>
                <MenuItem value="best">Best Picks</MenuItem>
                <MenuItem value="all">All Picks</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Filters row 2: text search */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 1, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 130 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Last Name</Typography>
            <TextField fullWidth size="small" placeholder="Last Name" value={searchLast} onChange={e => setSearchLast(e.target.value)} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 130 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>First Name</Typography>
            <TextField fullWidth size="small" placeholder="First Name" value={searchFirst} onChange={e => setSearchFirst(e.target.value)} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 110 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Employee#</Typography>
            <TextField fullWidth size="small" placeholder="Employee#" value={searchEmp} onChange={e => setSearchEmp(e.target.value)} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 110 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Badge#</Typography>
            <TextField fullWidth size="small" placeholder="Badge#" value={searchBadge} onChange={e => setSearchBadge(e.target.value)} />
          </Box>
          <Button variant="contained" size="small" onClick={applySearch}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' }, alignSelf: 'flex-end' }}>
            Search
          </Button>
          <Button variant="outlined" onClick={clearAll}
            sx={{ ml: 'auto', borderColor: '#008b8b', color: '#008b8b', alignSelf: 'flex-end' }}>
            CLEAR
          </Button>
        </Box>

        {/* Count */}
        <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
          ({filtered.length} player{filtered.length !== 1 ? 's' : ''} found)
        </Typography>

        {/* Note */}
        <Typography variant="caption" sx={{ color: '#555', display: 'block', mb: 2 }}>
          <strong>Note:</strong> Players will not display for a given week until scores for that week have been entered.
        </Typography>

        {/* Table */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={TH}>Season Place</TableCell>
              <TableCell sx={TH}>Team Member</TableCell>
              <TableCell sx={TH}>Employee #<br />Badge #</TableCell>
              <TableCell sx={TH}>Season Dates</TableCell>
              <TableCell sx={TH} align="center">Total Winning<br />Games Picked</TableCell>
              <TableCell sx={TH} align="center">Total Combined<br />Score Difference</TableCell>
              <TableCell sx={TH}>Season Ranking</TableCell>
              <TableCell sx={TH} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#888' }}>No players found.</TableCell>
              </TableRow>
            ) : paginated.map(player => (
              <TableRow key={player.playerId} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ordinal(player.rank)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.lastName}{player.lastName && player.firstName ? ', ' : ''}{player.firstName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{player.employeeNumber}</Typography>
                  <Typography variant="body2">{player.badgeNumber}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#666' }}>{player.seasonDates}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{player.correctPicks}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">—</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{player.rank} out of {filtered.length}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center">
                    <Tooltip title="Edit Player">
                      <IconButton size="small" onClick={() => openEditPlayer(player)} sx={{ color: '#555' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Player">
                      <IconButton size="small" onClick={() => confirmDelete(player)} sx={{ color: '#d32f2f' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      {/* New / Edit Player Dialog */}
      <Dialog open={playerDialog} onClose={() => setPlayerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#064e4e', color: '#fff' }}>
          {editingPlayer ? 'Edit Player' : 'New Player'}
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="First Name *"
                value={playerForm.firstName}
                onChange={e => setPlayerForm(f => ({ ...f, firstName: e.target.value }))}
                error={!!formErrors.firstName} helperText={formErrors.firstName} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Last Name"
                value={playerForm.lastName}
                onChange={e => setPlayerForm(f => ({ ...f, lastName: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Employee # *"
                value={playerForm.employeeNumber}
                onChange={e => setPlayerForm(f => ({ ...f, employeeNumber: e.target.value }))}
                error={!!formErrors.employeeNumber} helperText={formErrors.employeeNumber} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Badge #"
                value={playerForm.badgeNumber}
                onChange={e => setPlayerForm(f => ({ ...f, badgeNumber: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Email"
                value={playerForm.email}
                onChange={e => setPlayerForm(f => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Password *" type="password"
                value={playerForm.password}
                onChange={e => setPlayerForm(f => ({ ...f, password: e.target.value }))}
                error={!!formErrors.password} helperText={formErrors.password} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={savePlayer}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
            {editingPlayer ? 'Update' : 'Add Player'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Player?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {playerToDelete?.firstName} {playerToDelete?.lastName} and all their picks?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deletePlayer}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

