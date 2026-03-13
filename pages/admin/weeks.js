import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import {
  Paper, Box, Typography, Button, IconButton, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Tooltip, Divider, Stack, Avatar,
} from '@mui/material';
import AddIcon          from '@mui/icons-material/Add';
import EditIcon         from '@mui/icons-material/Edit';
import DeleteIcon       from '@mui/icons-material/Delete';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon  from '@mui/icons-material/EmojiEvents';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon   from '@mui/icons-material/RadioButtonChecked';
import {
  LS_SEASONS, LS_WEEKS, LS_GAMES,
  loadLS, saveLS, formatDate, NFL_TEAMS_BASE,
  INITIAL_SEASONS, INITIAL_WEEKS, INITIAL_GAMES,
} from '../../mock/store';

const TH = { backgroundColor: '#bfe6e6', color: '#064e4e', fontWeight: 700 };

const emptyWeek = { weekNumber: '', startDate: '', endDate: '', seasonId: '' };
const emptyGame = { homeTeamId: '', awayTeamId: '', gameDate: '' };

function scoreStatus(gamesForWeek) {
  if (!gamesForWeek.length) return { label: 'No Games', color: 'default' };
  const done = gamesForWeek.filter(g => g.winnerTeamId).length;
  if (done === gamesForWeek.length) return { label: 'Complete', color: 'success' };
  if (done > 0)                     return { label: `${done}/${gamesForWeek.length}`, color: 'warning' };
  return { label: 'Pending', color: 'default' };
}

function getTeamByNflId(teamId) {
  return NFL_TEAMS_BASE.find(t => t.teamId === teamId) || null;
}
function getTeamName(teamId)  { const t = getTeamByNflId(teamId); return t ? `${t.teamCity} ${t.teamName}` : teamId; }
function getTeamAbbr(teamId)  { const t = getTeamByNflId(teamId); return t ? t.abbr  : teamId; }
function getTeamColor(teamId) { const t = getTeamByNflId(teamId); return t ? t.color : '#666'; }

export default function WeeksPage() {
  const router = useRouter();

  const [seasons, setSeasons]               = useState([]);
  const [weeks,   setWeeks]                 = useState([]);
  const [games,   setGames]                 = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');

  // Week dialog
  const [weekDialog,   setWeekDialog]   = useState(false);
  const [weekForm,     setWeekForm]     = useState(emptyWeek);
  const [editingWeek,  setEditingWeek]  = useState(null);
  const [weekErrors,   setWeekErrors]   = useState({});

  // Delete week confirm
  const [deleteWeekDialog, setDeleteWeekDialog] = useState(false);
  const [weekToDelete,     setWeekToDelete]     = useState(null);

  // Games dialog
  const [gamesDialog,  setGamesDialog]  = useState(false);
  const [activeWeek,   setActiveWeek]   = useState(null);
  const [addGameOpen,  setAddGameOpen]  = useState(false);
  const [gameForm,     setGameForm]     = useState(emptyGame);
  const [gameErrors,   setGameErrors]   = useState({});

  // Inline score editing
  const [scoreEditing, setScoreEditing] = useState({});

  // Delete game confirm
  const [deleteGameDialog, setDeleteGameDialog] = useState(false);
  const [gameToDelete,     setGameToDelete]     = useState(null);

  // Results dialog
  const [resultsDialog, setResultsDialog]       = useState(false);
  const [resultsWeek,   setResultsWeek]         = useState(null);
  const [resultsDraft,  setResultsDraft]        = useState({}); // gameId -> { home, away, winner }

  // ─── Seed / load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = loadLS(LS_SEASONS, INITIAL_SEASONS);
    const w = loadLS(LS_WEEKS,   INITIAL_WEEKS);
    const g = loadLS(LS_GAMES,   INITIAL_GAMES);
    setSeasons(s);
    setWeeks(w);
    setGames(g);

    const qSeason = router.query.season;
    if (qSeason && s.find(x => x.seasonId === qSeason)) {
      setSelectedSeason(qSeason);
    } else {
      const active = s.find(x => x.status === 'active') || s[0];
      setSelectedSeason(active ? active.seasonId : '');
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredWeeks = useMemo(
    () => weeks
      .filter(w => w.seasonId === selectedSeason)
      .sort((a, b) => a.weekNumber - b.weekNumber),
    [weeks, selectedSeason],
  );

  const gamesForWeek  = (weekId) => games.filter(g => g.weekId === weekId);
  const activeGames   = activeWeek ? gamesForWeek(activeWeek.weekId) : [];
  const selectedSeasonName = seasons.find(s => s.seasonId === selectedSeason)?.seasonName || '';

  // ─── Week CRUD ───────────────────────────────────────────────────────────────
  function openNewWeek() {
    const nextNum = filteredWeeks.length
      ? Math.max(...filteredWeeks.map(w => w.weekNumber)) + 1
      : 1;
    setWeekForm({ ...emptyWeek, seasonId: selectedSeason, weekNumber: String(nextNum) });
    setEditingWeek(null);
    setWeekErrors({});
    setWeekDialog(true);
  }

  function openEditWeek(week) {
    setWeekForm({
      weekNumber: String(week.weekNumber),
      startDate:  week.startDate,
      endDate:    week.endDate,
      seasonId:   week.seasonId,
    });
    setEditingWeek(week);
    setWeekErrors({});
    setWeekDialog(true);
  }

  function validateWeek() {
    const e = {};
    if (!weekForm.weekNumber) e.weekNumber = 'Required';
    if (!weekForm.startDate)  e.startDate  = 'Required';
    if (!weekForm.endDate)    e.endDate    = 'Required';
    if (weekForm.startDate && weekForm.endDate && weekForm.startDate > weekForm.endDate)
      e.endDate = 'End must be after start';
    return e;
  }

  function saveWeek() {
    const e = validateWeek();
    if (Object.keys(e).length) { setWeekErrors(e); return; }
    let updated;
    if (editingWeek) {
      updated = weeks.map(w =>
        w.weekId === editingWeek.weekId
          ? { ...w, weekNumber: +weekForm.weekNumber, startDate: weekForm.startDate, endDate: weekForm.endDate }
          : w,
      );
    } else {
      updated = [...weeks, {
        weekId:     `w${Date.now()}`,
        seasonId:   weekForm.seasonId,
        weekNumber: +weekForm.weekNumber,
        startDate:  weekForm.startDate,
        endDate:    weekForm.endDate,
      }];
    }
    saveLS(LS_WEEKS, updated);
    setWeeks(updated);
    setWeekDialog(false);
  }

  function confirmDeleteWeek(week) { setWeekToDelete(week); setDeleteWeekDialog(true); }

  function deleteWeek() {
    const updatedGames = games.filter(g => g.weekId !== weekToDelete.weekId);
    const updatedWeeks = weeks.filter(w => w.weekId !== weekToDelete.weekId);
    saveLS(LS_WEEKS, updatedWeeks);
    saveLS(LS_GAMES, updatedGames);
    setWeeks(updatedWeeks);
    setGames(updatedGames);
    setDeleteWeekDialog(false);
    setWeekToDelete(null);
  }

  // ─── Games CRUD ──────────────────────────────────────────────────────────────
  function openGames(week) {
    setActiveWeek(week);
    setGameForm(emptyGame);
    setGameErrors({});
    setAddGameOpen(false);
    setGamesDialog(true);
  }

  function validateGame() {
    const e = {};
    if (!gameForm.homeTeamId)  e.homeTeamId = 'Required';
    if (!gameForm.awayTeamId)  e.awayTeamId = 'Required';
    if (!gameForm.gameDate)    e.gameDate   = 'Required';
    if (gameForm.homeTeamId && gameForm.awayTeamId && gameForm.homeTeamId === gameForm.awayTeamId)
      e.awayTeamId = 'Must differ from home team';
    return e;
  }

  function saveGame() {
    const e = validateGame();
    if (Object.keys(e).length) { setGameErrors(e); return; }
    const updated = [...games, {
      gameId:      `g${Date.now()}`,
      weekId:      activeWeek.weekId,
      homeTeamId:  gameForm.homeTeamId,
      awayTeamId:  gameForm.awayTeamId,
      gameDate:    gameForm.gameDate,
      homeScore:   null,
      awayScore:   null,
      winnerTeamId: null,
    }];
    saveLS(LS_GAMES, updated);
    setGames(updated);
    setGameForm(emptyGame);
    setGameErrors({});
    setAddGameOpen(false);
  }

  function confirmDeleteGame(game) { setGameToDelete(game); setDeleteGameDialog(true); }

  function deleteGame() {
    const updated = games.filter(g => g.gameId !== gameToDelete.gameId);
    saveLS(LS_GAMES, updated);
    setGames(updated);
    setDeleteGameDialog(false);
    setGameToDelete(null);
  }

  // ─── Results dialog ────────────────────────────────────────────────────────
  function openResults(week) {
    const wGames = gamesForWeek(week.weekId);
    const draft = {};
    wGames.forEach(g => {
      draft[g.gameId] = {
        home:   g.homeScore != null ? String(g.homeScore) : '',
        away:   g.awayScore != null ? String(g.awayScore) : '',
        winner: g.winnerTeamId || '',
      };
    });
    setResultsDraft(draft);
    setResultsWeek(week);
    setResultsDialog(true);
  }

  function setResultWinner(gameId, winner) {
    setResultsDraft(prev => ({ ...prev, [gameId]: { ...prev[gameId], winner } }));
  }

  function setResultScore(gameId, field, val) {
    setResultsDraft(prev => {
      const updated = { ...prev[gameId], [field]: val };
      // auto-set winner when both scores entered
      const h = parseInt(updated.home, 10);
      const a = parseInt(updated.away, 10);
      if (!isNaN(h) && !isNaN(a)) {
        const game = games.find(g => g.gameId === gameId);
        updated.winner = h > a ? game.homeTeamId : a > h ? game.awayTeamId : 'tie';
      }
      return { ...prev, [gameId]: updated };
    });
  }

  function saveAllResults() {
    const updated = games.map(g => {
      const d = resultsDraft[g.gameId];
      if (!d || !d.winner) return g;
      const hs = parseInt(d.home, 10);
      const as = parseInt(d.away, 10);
      return {
        ...g,
        homeScore:    isNaN(hs) ? g.homeScore    : hs,
        awayScore:    isNaN(as) ? g.awayScore    : as,
        winnerTeamId: d.winner,
      };
    });
    saveLS(LS_GAMES, updated);
    setGames(updated);
    setResultsDialog(false);
  }

  // ─── Scores ──────────────────────────────────────────────────────────────────
  function startScoreEdit(game) {
    setScoreEditing(prev => ({
      ...prev,
      [game.gameId]: {
        home: game.homeScore != null ? String(game.homeScore) : '',
        away: game.awayScore != null ? String(game.awayScore) : '',
      },
    }));
  }

  function cancelScoreEdit(gameId) {
    setScoreEditing(prev => { const n = { ...prev }; delete n[gameId]; return n; });
  }

  function saveScores(game) {
    const { home, away } = scoreEditing[game.gameId] || {};
    const hs = parseInt(home, 10);
    const as = parseInt(away, 10);
    if (isNaN(hs) || isNaN(as)) return;
    const winner = hs > as ? game.homeTeamId : as > hs ? game.awayTeamId : 'tie';
    const updated = games.map(g =>
      g.gameId === game.gameId
        ? { ...g, homeScore: hs, awayScore: as, winnerTeamId: winner }
        : g,
    );
    saveLS(LS_GAMES, updated);
    setGames(updated);
    cancelScoreEdit(game.gameId);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#064e4e' }}>
            Week Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewWeek}
            disabled={!selectedSeason}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}
          >
            New Week
          </Button>
        </Box>

        {/* Season Filter */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 240 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Season</Typography>
            <FormControl fullWidth size="small">
              <Select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
                {seasons.map(s => (
                  <MenuItem key={s.seasonId} value={s.seasonId}>{s.seasonName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" sx={{ color: '#555', alignSelf: 'center' }}>
            ({filteredWeeks.length} week{filteredWeeks.length !== 1 ? 's' : ''} found)
          </Typography>
        </Box>

        {/* Weeks Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={TH}>Week #</TableCell>
                <TableCell sx={TH}>Start Date</TableCell>
                <TableCell sx={TH}>End Date</TableCell>
                <TableCell sx={TH} align="center">Games</TableCell>
                <TableCell sx={TH} align="center">Scores</TableCell>
                <TableCell sx={TH} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWeeks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>
                    No weeks found for this season.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWeeks.map(week => {
                  const wGames = gamesForWeek(week.weekId);
                  const status = scoreStatus(wGames);
                  return (
                    <TableRow key={week.weekId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#008b8b', fontSize: 13 }}>
                            {week.weekNumber}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Week {week.weekNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(week.startDate)}</TableCell>
                      <TableCell>{formatDate(week.endDate)}</TableCell>
                      <TableCell align="center">
                        <Chip label={wGames.length} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={status.label}
                          color={status.color}
                          size="small"
                          icon={status.color === 'success' ? <CheckCircleIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Enter / Update Results">
                          <IconButton size="small" onClick={() => openResults(week)}
                            sx={{ color: '#b8860b' }}>
                            <EmojiEventsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Games">
                          <IconButton size="small" onClick={() => openGames(week)} sx={{ color: '#008b8b' }}>
                            <SportsFootballIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Week">
                          <IconButton size="small" onClick={() => openEditWeek(week)} sx={{ color: '#555' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Week">
                          <IconButton size="small" onClick={() => confirmDeleteWeek(week)} sx={{ color: '#d32f2f' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Add / Edit Week Dialog ─────────────────────────────────────────── */}
      <Dialog open={weekDialog} onClose={() => setWeekDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#064e4e', color: '#fff' }}>
          {editingWeek ? 'Edit Week' : 'New Week'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <TextField
            label="Week Number"
            type="number"
            value={weekForm.weekNumber}
            onChange={e => setWeekForm(f => ({ ...f, weekNumber: e.target.value }))}
            error={!!weekErrors.weekNumber}
            helperText={weekErrors.weekNumber}
            size="small"
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Start Date"
            type="date"
            value={weekForm.startDate}
            onChange={e => setWeekForm(f => ({ ...f, startDate: e.target.value }))}
            error={!!weekErrors.startDate}
            helperText={weekErrors.startDate}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={weekForm.endDate}
            onChange={e => setWeekForm(f => ({ ...f, endDate: e.target.value }))}
            error={!!weekErrors.endDate}
            helperText={weekErrors.endDate}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeekDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveWeek}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}
          >
            {editingWeek ? 'Update' : 'Add Week'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Week Confirm ────────────────────────────────────────────── */}
      <Dialog open={deleteWeekDialog} onClose={() => setDeleteWeekDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Week {weekToDelete?.weekNumber}?</DialogTitle>
        <DialogContent>
          <Typography>
            This will also delete all {gamesForWeek(weekToDelete?.weekId || '').length} game(s) in this week.
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteWeekDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteWeek}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── Games Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={gamesDialog}
        onClose={() => { setGamesDialog(false); setAddGameOpen(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#064e4e', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsFootballIcon />
          Week {activeWeek?.weekNumber} — {selectedSeasonName}
          <Chip
            label={`${activeGames.length} game${activeGames.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: '#008b8b', color: '#fff', ml: 1 }}
          />
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Games List */}
          {activeGames.length === 0 && !addGameOpen ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#aaa' }}>
              <SportsFootballIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography>No games yet — add the first game below.</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={TH}>Matchup</TableCell>
                  <TableCell sx={TH}>Date</TableCell>
                  <TableCell sx={TH} align="center">Score</TableCell>
                  <TableCell sx={TH} align="center">Winner</TableCell>
                  <TableCell sx={TH} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeGames.map(game => {
                  const isEditing  = !!scoreEditing[game.gameId];
                  const homeAbbr   = getTeamAbbr(game.homeTeamId);
                  const awayAbbr   = getTeamAbbr(game.awayTeamId);
                  const homeColor  = getTeamColor(game.homeTeamId);
                  const awayColor  = getTeamColor(game.awayTeamId);

                  return (
                    <TableRow key={game.gameId} hover>
                      {/* Matchup */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={awayAbbr} size="small"
                            sx={{ bgcolor: awayColor, color: '#fff', fontWeight: 700, fontSize: 11 }} />
                          <Typography variant="body2" sx={{ color: '#666' }}>@</Typography>
                          <Chip label={homeAbbr} size="small"
                            sx={{ bgcolor: homeColor, color: '#fff', fontWeight: 700, fontSize: 11 }} />
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#888' }}>
                          {getTeamName(game.awayTeamId)} @ {getTeamName(game.homeTeamId)}
                        </Typography>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="body2">{formatDate(game.gameDate)}</Typography>
                      </TableCell>

                      {/* Score */}
                      <TableCell align="center">
                        {game.winnerTeamId && !isEditing ? (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {game.awayScore} – {game.homeScore}
                          </Typography>
                        ) : isEditing ? (
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <TextField
                              size="small" type="number"
                              value={scoreEditing[game.gameId].away}
                              onChange={e => setScoreEditing(prev => ({
                                ...prev, [game.gameId]: { ...prev[game.gameId], away: e.target.value },
                              }))}
                              placeholder={awayAbbr}
                              inputProps={{ min: 0 }}
                              sx={{ width: 68 }}
                            />
                            <Typography>–</Typography>
                            <TextField
                              size="small" type="number"
                              value={scoreEditing[game.gameId].home}
                              onChange={e => setScoreEditing(prev => ({
                                ...prev, [game.gameId]: { ...prev[game.gameId], home: e.target.value },
                              }))}
                              placeholder={homeAbbr}
                              inputProps={{ min: 0 }}
                              sx={{ width: 68 }}
                            />
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#aaa' }}>–</Typography>
                        )}
                      </TableCell>

                      {/* Winner */}
                      <TableCell align="center">
                        {game.winnerTeamId && !isEditing ? (
                          game.winnerTeamId === 'tie' ? (
                            <Chip label="TIE" size="small" />
                          ) : (
                            <Chip
                              icon={<EmojiEventsIcon />}
                              label={getTeamAbbr(game.winnerTeamId)}
                              size="small"
                              sx={{
                                bgcolor: getTeamColor(game.winnerTeamId),
                                color: '#fff', fontWeight: 700,
                                '& .MuiChip-icon': { color: '#fff' },
                              }}
                            />
                          )
                        ) : (
                          <Typography variant="caption" sx={{ color: '#aaa' }}>TBD</Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        {isEditing ? (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button size="small" variant="contained" onClick={() => saveScores(game)}
                              sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' }, fontSize: 11, px: 1 }}>
                              Save
                            </Button>
                            <Button size="small" onClick={() => cancelScoreEdit(game.gameId)}
                              sx={{ fontSize: 11, px: 1 }}>
                              Cancel
                            </Button>
                          </Stack>
                        ) : (
                          <Stack direction="row" justifyContent="center">
                            <Tooltip title={game.winnerTeamId ? 'Edit Scores' : 'Enter Scores'}>
                              <IconButton size="small" onClick={() => startScoreEdit(game)}
                                sx={{ color: game.winnerTeamId ? '#555' : '#008b8b' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Game">
                              <IconButton size="small" onClick={() => confirmDeleteGame(game)}
                                sx={{ color: '#d32f2f' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Add Game Form */}
          {addGameOpen && (
            <>
              <Divider />
              <Box sx={{ p: 2, bgcolor: '#f5fafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#064e4e' }}>
                  Add New Game
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 200 }} error={!!gameErrors.awayTeamId}>
                    <InputLabel>Away Team</InputLabel>
                    <Select
                      value={gameForm.awayTeamId}
                      label="Away Team"
                      onChange={e => setGameForm(f => ({ ...f, awayTeamId: e.target.value }))}
                    >
                      {NFL_TEAMS_BASE.map(t => (
                        <MenuItem key={t.teamId} value={t.teamId}>{t.teamCity} {t.teamName}</MenuItem>
                      ))}
                    </Select>
                    {gameErrors.awayTeamId && (
                      <Typography variant="caption" color="error">{gameErrors.awayTeamId}</Typography>
                    )}
                  </FormControl>

                  <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: '#666' }}>@</Typography>
                  </Box>

                  <FormControl size="small" sx={{ minWidth: 200 }} error={!!gameErrors.homeTeamId}>
                    <InputLabel>Home Team</InputLabel>
                    <Select
                      value={gameForm.homeTeamId}
                      label="Home Team"
                      onChange={e => setGameForm(f => ({ ...f, homeTeamId: e.target.value }))}
                    >
                      {NFL_TEAMS_BASE.map(t => (
                        <MenuItem key={t.teamId} value={t.teamId}>{t.teamCity} {t.teamName}</MenuItem>
                      ))}
                    </Select>
                    {gameErrors.homeTeamId && (
                      <Typography variant="caption" color="error">{gameErrors.homeTeamId}</Typography>
                    )}
                  </FormControl>

                  <TextField
                    label="Game Date"
                    type="date"
                    size="small"
                    value={gameForm.gameDate}
                    onChange={e => setGameForm(f => ({ ...f, gameDate: e.target.value }))}
                    error={!!gameErrors.gameDate}
                    helperText={gameErrors.gameDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 160 }}
                  />
                </Stack>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #eee', justifyContent: 'space-between' }}>
          <Box>
            {addGameOpen ? (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={saveGame}
                  sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
                  Add Game
                </Button>
                <Button onClick={() => { setAddGameOpen(false); setGameErrors({}); }}>
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setAddGameOpen(true)}
                sx={{ borderColor: '#008b8b', color: '#008b8b' }}
              >
                Add Game
              </Button>
            )}
          </Box>
          <Button onClick={() => { setGamesDialog(false); setAddGameOpen(false); }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Results Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={resultsDialog} onClose={() => setResultsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#064e4e', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon />
          Week {resultsWeek?.weekNumber} — Match Results
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {resultsWeek && gamesForWeek(resultsWeek.weekId).length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#aaa' }}>
              <Typography>No games in this week yet. Add games first.</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={TH}>Matchup</TableCell>
                  <TableCell sx={{ ...TH, width: 80, textAlign: 'center' }}>Away Sc.</TableCell>
                  <TableCell sx={{ ...TH, width: 80, textAlign: 'center' }}>Home Sc.</TableCell>
                  <TableCell sx={{ ...TH, textAlign: 'center' }}>Winner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(resultsWeek ? gamesForWeek(resultsWeek.weekId) : []).map(game => {
                  const d      = resultsDraft[game.gameId] || { home: '', away: '', winner: '' };
                  const winner = d.winner;
                  return (
                    <TableRow key={game.gameId} hover>
                      {/* Matchup */}
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getTeamName(game.awayTeamId)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>vs</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getTeamName(game.homeTeamId)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Away score */}
                      <TableCell align="center">
                        <TextField size="small" type="number"
                          value={d.away}
                          onChange={e => setResultScore(game.gameId, 'away', e.target.value)}
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          sx={{ width: 70 }}
                        />
                      </TableCell>

                      {/* Home score */}
                      <TableCell align="center">
                        <TextField size="small" type="number"
                          value={d.home}
                          onChange={e => setResultScore(game.gameId, 'home', e.target.value)}
                          inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          sx={{ width: 70 }}
                        />
                      </TableCell>

                      {/* Winner selector */}
                      <TableCell>
                        <Stack spacing={0.5}>
                          {[
                            { label: getTeamAbbr(game.awayTeamId) + ' (Away)', value: game.awayTeamId, color: getTeamColor(game.awayTeamId) },
                            { label: 'TIE',                                      value: 'tie',           color: '#9e9e9e' },
                            { label: getTeamAbbr(game.homeTeamId) + ' (Home)', value: game.homeTeamId, color: getTeamColor(game.homeTeamId) },
                          ].map(opt => (
                            <Box key={opt.value}
                              onClick={() => setResultWinner(game.gameId, opt.value)}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 0.8,
                                cursor: 'pointer', borderRadius: 1, px: 0.8, py: 0.3,
                                bgcolor: winner === opt.value ? opt.color + '22' : 'transparent',
                                border: '1px solid ' + (winner === opt.value ? opt.color : 'transparent'),
                                transition: 'all 0.12s',
                                '&:hover': { bgcolor: opt.color + '18' },
                              }}
                            >
                              {winner === opt.value
                                ? <RadioButtonCheckedIcon   sx={{ fontSize: 16, color: opt.color }} />
                                : <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#bbb' }} />
                              }
                              <Typography variant="caption" sx={{
                                fontWeight: winner === opt.value ? 700 : 400,
                                color: winner === opt.value ? opt.color : '#555',
                              }}>
                                {opt.label}
                              </Typography>
                              {winner === opt.value && <EmojiEventsIcon sx={{ fontSize: 13, color: opt.color, ml: 'auto' }} />}
                            </Box>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eee', justifyContent: 'space-between', px: 2 }}>
          <Typography variant="caption" sx={{ color: '#888' }}>
            Scores are optional — selecting a winner is enough.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setResultsDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveAllResults}
              sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
              Save Results
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ── Delete Game Confirm ────────────────────────────────────────────── */}
      <Dialog open={deleteGameDialog} onClose={() => setDeleteGameDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this game?</DialogTitle>
        <DialogContent>
          {gameToDelete && (
            <Typography>
              {getTeamName(gameToDelete.awayTeamId)} @ {getTeamName(gameToDelete.homeTeamId)}
              {' '}on {formatDate(gameToDelete.gameDate)} — this action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGameDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteGame}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
