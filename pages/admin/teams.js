import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box, Button, Avatar, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, FormControl, InputLabel,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import CloseIcon  from '@mui/icons-material/Close';
import {
  loadLS, saveLS,
  LS_SEASONS, LS_TEAMS,
  INITIAL_SEASONS, INITIAL_TEAMS, NFL_TEAMS_BASE,
  formatDate,
} from '../../mock/store';

const TH = { backgroundColor: '#bfe6e6', color: '#064e4e', fontWeight: 700 };
const EMPTY_FORM = { teamName: '', teamCity: '', abbr: '', color: '#008b8b', seasonId: '' };

// Format season dropdown label
function seasonLabel(s) {
  if (!s) return '';
  const start = s.startDate ? new Date(s.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  const end   = s.endDate   ? new Date(s.endDate   + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  return `${s.seasonName}: ${start}-${end}`;
}

export default function TeamsPage() {
  const [seasons, setSeasons] = useState([]);
  const [teams,   setTeams]   = useState([]);

  useEffect(() => {
    const s = loadLS(LS_SEASONS, INITIAL_SEASONS);
    setSeasons(s);
    setTeams(loadLS(LS_TEAMS, INITIAL_TEAMS));
    // default to active season
    const active = s.find(x => x.status === 'active') || s[0];
    if (active) setSeasonFilter(active.seasonId);
  }, []);

  const saveTeams = (next) => { setTeams(next); saveLS(LS_TEAMS, next); };

  // filters
  const [seasonFilter,  setSeasonFilter]  = useState('all');
  const [searchInput,   setSearchInput]   = useState('');
  const [searchApplied, setSearchApplied] = useState('');

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchSeason = seasonFilter === 'all' || t.seasonId === seasonFilter;
      const matchSearch = !searchApplied || `${t.teamCity} ${t.teamName}`.toLowerCase().includes(searchApplied.toLowerCase());
      return matchSeason && matchSearch;
    });
  }, [teams, seasonFilter, searchApplied]);

  // modal
  const [open,        setOpen]        = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [nflTemplate, setNflTemplate] = useState('');
  const [teamImage,   setTeamImage]   = useState(null);   // data URL or null
  const fileInputRef = useRef(null);

  const openNew = () => {
    setEditing(null);
    setNflTemplate('');
    setTeamImage(null);
    setForm({ ...EMPTY_FORM, seasonId: seasonFilter !== 'all' ? seasonFilter : (seasons[0]?.seasonId || '') });
    setOpen(true);
  };

  const openView = (t) => {
    setEditing(t);
    setNflTemplate('');
    setTeamImage(t.image || null);
    setForm({ teamName: t.teamName, teamCity: t.teamCity, abbr: t.abbr, color: t.color, seasonId: t.seasonId });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const applyTemplate = (teamId) => {
    const nfl = NFL_TEAMS_BASE.find((t) => t.teamId === teamId);
    if (nfl) setForm((f) => ({ ...f, teamName: nfl.teamName, teamCity: nfl.teamCity, abbr: nfl.abbr, color: nfl.color }));
    setNflTemplate(teamId);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTeamImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.teamName.trim() || !form.seasonId) return;
    if (editing) {
      saveTeams(teams.map((t) => t.id === editing.id ? { ...t, ...form, image: teamImage } : t));
    } else {
      const id = `custom-${Date.now()}`;
      saveTeams([...teams, { id, teamId: id, ...form, image: teamImage }]);
    }
    setOpen(false);
  };

  return (
    <AdminLayout>
      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700} color="#064e4e">Teams</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}
          sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
          New Team
        </Button>
      </Box>

      {/* ── Filters ── */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Season</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={seasonFilter}
                onChange={(e) => { setSeasonFilter(e.target.value); setSearchApplied(''); setSearchInput(''); }}
              >
                <MenuItem value="all">All Seasons</MenuItem>
                {seasons.map((s) => (
                  <MenuItem key={s.seasonId} value={s.seasonId}>{seasonLabel(s)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Team Name</Typography>
            <TextField
              fullWidth size="small" placeholder="Team Name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchApplied(searchInput)}
            />
          </Box>
          <Button variant="contained" size="small"
            onClick={() => setSearchApplied(searchInput)}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' }, alignSelf: 'flex-end' }}>
            Search
          </Button>
          <Button variant="outlined"
            onClick={() => { setSeasonFilter('all'); setSearchInput(''); setSearchApplied(''); }}
            sx={{ ml: 'auto', borderColor: '#008b8b', color: '#008b8b', alignSelf: 'flex-end' }}>
            CLEAR
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
          ({filtered.length} team{filtered.length !== 1 ? 's' : ''} found)
        </Typography>
      </Paper>

      {/* ── Table ── */}
      <Paper elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Team Name', 'Team City', 'Season', 'Actions'].map((h) => (
                <TableCell key={h} sx={TH}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#aaa' }}>No teams found.</TableCell></TableRow>
            )}
            {filtered.map((t) => {
              const season = seasons.find((s) => s.seasonId === t.seasonId);
              return (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {t.image ? (
                        <Avatar src={t.image} sx={{ width: 30, height: 30 }} />
                      ) : (
                        <Avatar sx={{ width: 30, height: 30, bgcolor: t.color, fontSize: 10, fontWeight: 700 }}>{t.abbr}</Avatar>
                      )}
                      <Typography fontWeight={600}>{t.teamName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{t.teamCity}</TableCell>
                  <TableCell>
                    {season ? `${season.seasonName}: ${formatDate(season.startDate)}-${formatDate(season.endDate)}` : t.seasonId}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => openView(t)}
                      sx={{ borderColor: '#008b8b', color: '#008b8b' }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* ── New / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#008b8b', color: '#fff', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editing ? 'Edit Team' : 'New Team'}
          <IconButton size="small" onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

          {/* NFL template picker (new only) */}
          {!editing && (
            <FormControl fullWidth size="small">
              <InputLabel>Pick NFL template (optional)</InputLabel>
              <Select value={nflTemplate} label="Pick NFL template (optional)" onChange={(e) => applyTemplate(e.target.value)}>
                <MenuItem value=""><em>— custom —</em></MenuItem>
                {NFL_TEAMS_BASE.map((t) => (
                  <MenuItem key={t.teamId} value={t.teamId}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 22, height: 22, bgcolor: t.color, fontSize: 8, fontWeight: 700 }}>{t.abbr}</Avatar>
                      {t.teamCity} {t.teamName}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField label="Team Name" fullWidth value={form.teamName}
            onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
          <TextField label="Team City Name" fullWidth value={form.teamCity}
            onChange={(e) => setForm({ ...form, teamCity: e.target.value })} />

          <FormControl fullWidth size="small">
            <InputLabel>Season</InputLabel>
            <Select value={form.seasonId} label="Season" onChange={(e) => setForm({ ...form, seasonId: e.target.value })}>
              {seasons.map((s) => <MenuItem key={s.seasonId} value={s.seasonId}>{seasonLabel(s)}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Team Image */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Team Image:</Typography>
            <Box sx={{ width: 80, height: 80, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, bgcolor: '#f9f9f9' }}>
              {teamImage ? (
                <img src={teamImage} alt="team" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <Typography variant="caption" color="text.secondary" align="center">No<br />Image</Typography>
              )}
            </Box>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageSelect} />
            <Button size="small" variant="outlined" onClick={() => fileInputRef.current?.click()}
              sx={{ borderColor: '#888', color: '#333' }}>
              Select Image
            </Button>
          </Box>

          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' }, mt: 1 }}>
            {editing ? 'Save Changes' : 'Add Team'}
          </Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
