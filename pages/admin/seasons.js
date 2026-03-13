import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  loadLS, saveLS,
  LS_SEASONS, LS_WEEKS, LS_GAMES, LS_PLAYERS,
  INITIAL_SEASONS, INITIAL_WEEKS, INITIAL_GAMES, INITIAL_PLAYERS,
  formatDate,
} from '../../mock/store';

const STATUS_COLORS = { active: 'success', upcoming: 'warning', completed: 'default' };
const EMPTY_FORM    = { seasonName: '', startDate: '', endDate: '', status: 'upcoming' };
const TH = { backgroundColor: '#bfe6e6', color: '#064e4e', fontWeight: 700 };

export default function SeasonsPage() {
  const router = useRouter();

  const [seasons,  setSeasons]  = useState([]);
  const [weeks,    setWeeks]    = useState([]);
  const [games,    setGames]    = useState([]);
  const [players]               = useState(() => loadLS(LS_PLAYERS, INITIAL_PLAYERS));

  // Season filter dropdown
  const [filterSeason, setFilterSeason] = useState('all');

  // seed on first load
  useEffect(() => {
    const s = loadLS(LS_SEASONS, INITIAL_SEASONS);
    const w = loadLS(LS_WEEKS,   INITIAL_WEEKS);
    const g = loadLS(LS_GAMES,   INITIAL_GAMES);
    setSeasons(s); setWeeks(w); setGames(g);
  }, []);

  const saveSeasons = (next) => { setSeasons(next); saveLS(LS_SEASONS, next); };

  // modal state
  const [open,    setOpen]    = useState(false);
  const [editing, setEditing] = useState(null);   // null = new
  const [form,    setForm]    = useState(EMPTY_FORM);

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ seasonName: s.seasonName, startDate: s.startDate, endDate: s.endDate, status: s.status }); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    if (!form.seasonName.trim() || !form.startDate || !form.endDate) return;
    if (editing) {
      saveSeasons(seasons.map((s) => s.seasonId === editing.seasonId ? { ...s, ...form } : s));
    } else {
      const id = `s${Date.now()}`;
      saveSeasons([...seasons, { seasonId: id, ...form }]);
    }
    setOpen(false);
  };

  // per-season computed stats
  const stats = useMemo(() => {
    const map = {};
    seasons.forEach((s) => {
      const sw  = weeks.filter((w) => w.seasonId === s.seasonId);
      const sg  = games.filter((g) => sw.find((w) => w.weekId === g.weekId));
      const hasGames = sg.length > 0;
      map[s.seasonId] = {
        totalWeeks:   sw.length,
        totalGames:   sg.length,
        totalPlayers: players.length,
        hasGames,
      };
    });
    return map;
  }, [seasons, weeks, games, players]);

  // Filtered list for table
  const filteredSeasons = useMemo(
    () => filterSeason === 'all' ? seasons : seasons.filter(s => s.seasonId === filterSeason),
    [seasons, filterSeason],
  );

  // Warning: no upcoming / active season in the future
  const hasUpcoming = seasons.some(s => s.status === 'upcoming' || s.status === 'active');

  return (
    <AdminLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700} color="#064e4e">Seasons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}
          sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
          New Season
        </Button>
      </Box>

      {/* Filter bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Season</Typography>
            <FormControl fullWidth size="small">
              <Select value={filterSeason} onChange={e => setFilterSeason(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                {seasons.map(s => (
                  <MenuItem key={s.seasonId} value={s.seasonId}>{s.seasonName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button variant="outlined"
            onClick={() => setFilterSeason('all')}
            sx={{ ml: 'auto', borderColor: '#008b8b', color: '#008b8b', alignSelf: 'flex-end' }}
          >
            CLEAR
          </Button>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#555' }}>
            ({filteredSeasons.length} season{filteredSeasons.length !== 1 ? 's' : ''} found)
          </Typography>
          {!hasUpcoming && (
            <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
              Upcoming NFL Season needs to be entered.
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Season Name', 'Season Dates', 'Status', 'Weeks', 'Teams', 'Total Games', 'Players', 'Actions'].map((h) => (
                <TableCell key={h} sx={TH}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSeasons.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: '#aaa' }}>No seasons yet — click New Season to add one.</TableCell></TableRow>
            )}
            {filteredSeasons.map((s) => {
              const st = stats[s.seasonId] || {};
              return (
                <TableRow key={s.seasonId} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{s.seasonName}</Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" color={STATUS_COLORS[s.status] || 'default'} />
                  </TableCell>
                  <TableCell align="center">{st.totalWeeks ?? 0}</TableCell>
                  <TableCell align="center">32</TableCell>
                  <TableCell align="center">
                    {!st.hasGames && st.totalWeeks > 0 ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <WarningAmberIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                        <Typography variant="caption" color="error">* Games need to be entered!</Typography>
                      </Box>
                    ) : (
                      st.totalGames ?? 0
                    )}
                  </TableCell>
                  <TableCell align="center">{st.totalPlayers ?? 0}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => openEdit(s)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary"
                        onClick={() => router.push(`/admin/weeks?season=${s.seasonId}`)} title="View Weeks">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* ── New / Edit Season Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#008b8b', color: '#fff', fontWeight: 700 }}>
          {editing ? 'Edit Season' : 'New Season'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Season Name" fullWidth value={form.seasonName}
            onChange={(e) => setForm({ ...form, seasonName: e.target.value })} />
          <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
            value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }}
            value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
            {editing ? 'Save Changes' : 'Create Season'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
