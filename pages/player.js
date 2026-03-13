import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, LinearProgress,
  BottomNavigation, BottomNavigationAction,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon     from '@mui/icons-material/ArrowBack';
import HomeIcon          from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon      from '@mui/icons-material/BarChart';
import PersonIcon        from '@mui/icons-material/Person';
import LockOutlinedIcon  from '@mui/icons-material/LockOutlined';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import EventIcon         from '@mui/icons-material/Event';
import { useRouter } from 'next/router';
import {
  loadLS, saveLS,
  LS_SESSION, LS_SEASONS, LS_WEEKS, LS_GAMES, LS_TEAMS, LS_PICKS, LS_PLAYERS,
} from '../mock/store';

function fmtRange(start, end) {
  if (!start || !end) return '';
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sm = s.toLocaleString('en-US', { month: 'short' });
  const yr = s.getFullYear();
  if (s.getMonth() === e.getMonth()) return sm + ' ' + s.getDate() + '-' + e.getDate() + ', ' + yr;
  return sm + ' ' + s.getDate() + ' - ' + e.toLocaleString('en-US', { month: 'short' }) + ' ' + e.getDate() + ', ' + yr;
}

function fmtDay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[d.getDay()] + ' ' + d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function WeekCard({ week, state, hasPicks, correctCount, totalGames, onClick }) {
  const clickable = state !== 'locked';
  const cfg = {
    live:           { bg: 'linear-gradient(135deg,#103a6e 0%,#1565c0 100%)', border: '#2979ff' },
    upcoming_first: { bg: 'linear-gradient(135deg,#5a1010 0%,#b71c1c 100%)', border: '#e53935' },
    upcoming:       { bg: 'linear-gradient(135deg,#0d3b1a 0%,#1b5e20 100%)', border: '#388e3c' },
    completed:      { bg: '#12182a', border: '#1e2740' },
    locked:         { bg: '#0d1122', border: '#141c2e' },
  };
  const c = cfg[state] || cfg.locked;

  return (
    <Box
      onClick={clickable ? onClick : undefined}
      sx={{
        background: c.bg, border: '1.5px solid ' + c.border,
        borderRadius: 2, p: 1.5, minHeight: 105,
        cursor: clickable ? 'pointer' : 'default',
        opacity: state === 'locked' ? 0.5 : 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'transform 0.12s',
        '&:hover': clickable ? { transform: 'translateY(-2px)' } : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minHeight: 18 }}>
        {state === 'live' && (
          <>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#27c9a0', boxShadow: '0 0 5px #27c9a0' }} />
            <Typography sx={{ color: '#27c9a0', fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1.2 }}>LIVE</Typography>
          </>
        )}
        {(state === 'upcoming_first' || state === 'upcoming') && (
          <>
            <EventIcon sx={{ fontSize: 10, color: state === 'upcoming_first' ? '#ef9a9a' : '#81c784' }} />
            <Typography sx={{ color: state === 'upcoming_first' ? '#ef9a9a' : '#81c784', fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1.2 }}>UPCOMING</Typography>
          </>
        )}
        {state === 'completed' && (
          <Typography sx={{ color: '#3a4a6a', fontSize: '0.6rem', letterSpacing: 1 }}>Completed</Typography>
        )}
        {state === 'locked' && (
          <Typography sx={{ color: '#1e2a44', fontSize: '0.6rem', letterSpacing: 1 }}>Locked</Typography>
        )}
      </Box>

      <Typography sx={{
        color: state === 'locked' ? '#1a2438' : state === 'completed' ? '#4a5a80' : '#fff',
        fontWeight: 900,
        fontSize: (state === 'live' || state === 'upcoming_first') ? '1.4rem' : '1.05rem',
        textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 1.1, my: 0.3,
      }}>
        Week {week.weekNumber}
      </Typography>

      <Box sx={{ minHeight: 16 }}>
        {state === 'completed' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: hasPicks ? '#27c9a0' : '#2a3a5a' }} />
            <Typography sx={{ color: '#3a4a6a', fontSize: '0.62rem' }}>
              {hasPicks ? correctCount + '/' + totalGames + ' Correct' : 'No picks'}
            </Typography>
          </Box>
        )}
        {state === 'locked' && <LockOutlinedIcon sx={{ fontSize: 14, color: '#1a2438' }} />}
        {(state === 'live' || state === 'upcoming_first' || state === 'upcoming') && hasPicks && (
          <Typography sx={{ color: '#90caf9', fontSize: '0.6rem', fontWeight: 700 }}>Picks Saved</Typography>
        )}
      </Box>
    </Box>
  );
}

export default function PlayerPage() {
  const router = useRouter();
  const [session, setSession]           = useState(null);
  const [view, setView]                 = useState('weeks');
  const [activeWeek, setActiveWeek]     = useState(null);
  const [pickMap, setPickMap]           = useState({});
  const [allPicks, setAllPicks]         = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [seasonWeeks, setSeasonWeeks]   = useState([]);
  const [allGames, setAllGames]         = useState([]);
  const [teams, setTeams]               = useState([]);
  const [players, setPlayers]           = useState([]);
  const [lbOpen, setLbOpen]             = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);

  useEffect(() => {
    const sess = loadLS(LS_SESSION, null);
    if (!sess || sess.type !== 'player') { router.replace('/'); return; }
    setSession(sess);

    const allSeasons = loadLS(LS_SEASONS, []);
    const weeks      = loadLS(LS_WEEKS,   []);
    const games      = loadLS(LS_GAMES,   []);
    const teamsData  = loadLS(LS_TEAMS,   []);
    const pks        = loadLS(LS_PICKS,   []);
    const pls        = loadLS(LS_PLAYERS, []);
    const today      = new Date();

    const active =
      allSeasons.find(s => {
        const s1 = new Date(s.startDate + 'T00:00:00');
        const e1 = new Date(s.endDate   + 'T00:00:00');
        return today >= s1 && today <= e1;
      }) ||
      allSeasons.filter(s => s.status === 'active').pop() ||
      allSeasons[allSeasons.length - 1] || null;

    setActiveSeason(active);

    if (active) {
      const sw = weeks
        .filter(w => w.seasonId === active.seasonId)
        .sort((a, b) => a.weekNumber - b.weekNumber);
      setSeasonWeeks(sw);
    }

    setAllGames(games);
    setTeams(teamsData);
    setAllPicks(pks);
    setPlayers(pls);
  }, []);

  const tName  = id => { const t = teams.find(t => t.teamId === id && t.seasonId === activeSeason?.seasonId); return t ? t.teamCity + ' ' + t.teamName : id; };
  const tColor = id => { const t = teams.find(t => t.teamId === id && t.seasonId === activeSeason?.seasonId); return t?.color || '#2a3450'; };
  const tAbbr  = id => { const t = teams.find(t => t.teamId === id && t.seasonId === activeSeason?.seasonId); return t?.abbr || id.slice(0, 3).toUpperCase(); };

  const gamesFor     = wid => allGames.filter(g => g.weekId === wid);
  const weekHasPicks = wid => allPicks.some(p => p.playerId === session?.playerId && p.weekId === wid && p.gameId !== 'COMBINED');
  const correctCount = wid => {
    const games = gamesFor(wid);
    return allPicks
      .filter(p => p.playerId === session?.playerId && p.weekId === wid && p.gameId !== 'COMBINED')
      .filter(p => { const g = games.find(g => g.gameId === p.gameId); return g && g.winnerTeamId && g.winnerTeamId === p.pickedTeamId; })
      .length;
  };

  const openPicksView = week => {
    const games = gamesFor(week.weekId);
    if (!games.length) return;
    setActiveWeek(week);
    const map = {};
    allPicks
      .filter(p => p.playerId === session.playerId && p.weekId === week.weekId && p.gameId !== 'COMBINED')
      .forEach(p => { map[p.gameId] = p.pickedTeamId; });
    setPickMap(map);
    setView('picks');
  };

  const submitPicks = () => {
    const games   = gamesFor(activeWeek.weekId);
    const updated = allPicks.filter(p => !(p.playerId === session.playerId && p.weekId === activeWeek.weekId));
    games.forEach(game => {
      if (pickMap[game.gameId]) {
        updated.push({
          pickId: 'pk_' + session.playerId + '_' + game.gameId,
          playerId: session.playerId,
          weekId: activeWeek.weekId,
          gameId: game.gameId,
          pickedTeamId: pickMap[game.gameId],
        });
      }
    });
    saveLS(LS_PICKS, updated);
    setAllPicks(updated);
    setView('weeks');
  };

  const leaderboard = useMemo(() => {
    return players.map(pl => {
      const correct = allPicks
        .filter(p => p.playerId === pl.playerId && p.gameId !== 'COMBINED')
        .filter(p => { const g = allGames.find(g => g.gameId === p.gameId); return g && g.winnerTeamId && g.winnerTeamId === p.pickedTeamId; })
        .length;
      return { name: pl.firstName + ' ' + pl.lastName, correct };
    }).sort((a, b) => b.correct - a.correct);
  }, [allPicks, players, allGames]);

  if (!session) return null;

  const today = new Date();
  let firstUpcoming = true;
  const weekData = seasonWeeks.map(w => {
    const games = gamesFor(w.weekId);
    const s     = new Date(w.startDate + 'T00:00:00');
    const e     = new Date(w.endDate   + 'T23:59:59');
    let state;
    if      (today >= s && today <= e) state = 'live';
    else if (today > e)                state = 'completed';
    else if (!games.length)            state = 'locked';
    else if (firstUpcoming)          { state = 'upcoming_first'; firstUpcoming = false; }
    else                               state = 'upcoming';
    return { w, state, games };
  });

  const pickedWeeks = seasonWeeks.filter(w => weekHasPicks(w.weekId)).length;

  // ── CONFIRM VIEW ──────────────────────────────────────────────────────────
  if (view === 'confirm') {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#060a12 0%,#0a1020 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        px: 3, textAlign: 'center',
      }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4,
        }}>
          <SportsFootballIcon sx={{ fontSize: 38, color: 'rgba(255,255,255,0.3)' }} />
        </Box>
        <Typography sx={{
          color: '#fff', fontWeight: 900, fontSize: '1.9rem',
          lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: 1, mb: 2,
        }}>
          Lock In Your<br />Picks
        </Typography>
        <Typography sx={{ color: '#5a6a8a', fontSize: '0.88rem', mb: 5, lineHeight: 1.6, maxWidth: 280 }}>
          {"You've made your predictions for "}
          <Box component="span" sx={{ color: '#e8b84b', fontWeight: 700 }}>Week {activeWeek?.weekNumber}</Box>
          {'. Are you ready?'}
        </Typography>
        <Button fullWidth variant="contained" onClick={submitPicks} sx={{
          bgcolor: '#e8b84b', color: '#000', fontWeight: 900, letterSpacing: 2,
          py: 1.8, fontSize: '0.88rem', borderRadius: 2, maxWidth: 300, mb: 2.5,
          textTransform: 'uppercase', '&:hover': { bgcolor: '#d4a030' },
        }}>
          Submit Predictions
        </Button>
        <Button onClick={() => setView('picks')} sx={{ color: '#3a4a6a', textTransform: 'none', fontSize: '0.85rem' }}>
          Wait, Go Back
        </Button>
      </Box>
    );
  }

  // ── PICKS VIEW ────────────────────────────────────────────────────────────
  if (view === 'picks') {
    const games     = gamesFor(activeWeek.weekId);
    const madeCount = games.filter(g => pickMap[g.gameId]).length;
    const allMade   = games.length > 0 && madeCount === games.length;

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#090d18', display: 'flex', flexDirection: 'column' }}>

        <Box sx={{
          bgcolor: '#0c1018', borderBottom: '1px solid #1a2035',
          px: 2, py: 1.2, display: 'flex', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <Box onClick={() => setView('weeks')} sx={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', '&:hover': { bgcolor: '#1a2035' },
          }}>
            <ArrowBackIcon sx={{ color: '#c8d0e0', fontSize: 20 }} />
          </Box>
          <Typography sx={{ flex: 1, textAlign: 'center', color: '#e0e4f0', fontWeight: 800, fontSize: '0.95rem' }}>
            Week's Games & Prediction
          </Typography>
          <Box sx={{ width: 36 }} />
        </Box>

        <Box sx={{ display: 'flex', bgcolor: '#0c1018', borderBottom: '1px solid #1a2035', px: 3, py: 1.2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ color: '#4a5a7a', fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase', mb: 0.3 }}>Active Season</Typography>
            <Typography sx={{ color: '#e0e4f0', fontWeight: 800, fontSize: '0.85rem' }}>{activeSeason?.seasonName || '—'}</Typography>
          </Box>
          <Box sx={{ width: '1px', bgcolor: '#1a2035', my: 0.5 }} />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ color: '#4a5a7a', fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase', mb: 0.3 }}>Active Week</Typography>
            <Typography sx={{ color: '#e0e4f0', fontWeight: 800, fontSize: '0.85rem' }}>WEEK {activeWeek.weekNumber}</Typography>
          </Box>
        </Box>

        <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography sx={{ color: '#c8d0e0', fontSize: '0.75rem', fontWeight: 600 }}>Predictions Made</Typography>
            <Typography sx={{ color: '#27c9a0', fontSize: '0.75rem', fontWeight: 800 }}>{madeCount}/{games.length}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={games.length ? (madeCount / games.length) * 100 : 0}
            sx={{ height: 4, borderRadius: 2, bgcolor: '#1a2035', '& .MuiLinearProgress-bar': { bgcolor: '#27c9a0' } }} />
        </Box>

        <Box sx={{ flex: 1, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto' }}>
          {games.map(game => {
            const away   = game.awayTeamId;
            const home   = game.homeTeamId;
            const picked = pickMap[game.gameId];
            return (
              <Box key={game.gameId} sx={{
                bgcolor: '#0d1322', borderRadius: 2, overflow: 'hidden',
                border: '1px solid ' + (picked ? '#1e3a4a' : '#161e30'),
              }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 0.7, bgcolor: '#08101c', borderBottom: '1px solid #161e30',
                }}>
                  <Typography sx={{ color: '#3a4a6a', fontSize: '0.67rem' }}>{fmtDay(game.gameDate)}</Typography>
                  {picked && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#27c9a0' }} />
                      <Typography sx={{ color: '#27c9a0', fontSize: '0.62rem', fontWeight: 800, letterSpacing: 1 }}>PREDICTED</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                  <Box
                    onClick={() => setPickMap(prev => ({ ...prev, [game.gameId]: away }))}
                    sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 0.8, px: 1.5, py: 2,
                      cursor: 'pointer', position: 'relative', transition: 'background 0.1s',
                      border: '2px solid ' + (picked === away ? '#27c9a0' : 'transparent'),
                      borderRadius: 1.5, m: '4px',
                      bgcolor: picked === away ? 'rgba(39,201,160,0.08)' : 'transparent',
                      '&:hover': { bgcolor: picked === away ? 'rgba(39,201,160,0.12)' : 'rgba(255,255,255,0.03)' },
                    }}
                  >
                    {picked === away && (
                      <Box sx={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: '50%',
                        bgcolor: '#27c9a0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Typography sx={{ color: '#000', fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</Typography>
                      </Box>
                    )}
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 1.5,
                      bgcolor: tColor(away), border: '1.5px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.75rem' }}>{tAbbr(away)}</Typography>
                    </Box>
                    <Typography sx={{
                      color: picked === away ? '#27c9a0' : '#c0c8da',
                      fontWeight: picked === away ? 700 : 500,
                      fontSize: '0.78rem', textAlign: 'center', lineHeight: 1.2,
                    }}>
                      {tName(away)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1, bgcolor: '#08101c', minWidth: 32 }}>
                    <Typography sx={{ color: '#1e2a44', fontWeight: 900, fontSize: '0.68rem', letterSpacing: 1 }}>VS</Typography>
                  </Box>

                  <Box
                    onClick={() => setPickMap(prev => ({ ...prev, [game.gameId]: home }))}
                    sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 0.8, px: 1.5, py: 2,
                      cursor: 'pointer', position: 'relative', transition: 'background 0.1s',
                      border: '2px solid ' + (picked === home ? '#27c9a0' : 'transparent'),
                      borderRadius: 1.5, m: '4px',
                      bgcolor: picked === home ? 'rgba(39,201,160,0.08)' : 'transparent',
                      '&:hover': { bgcolor: picked === home ? 'rgba(39,201,160,0.12)' : 'rgba(255,255,255,0.03)' },
                    }}
                  >
                    {picked === home && (
                      <Box sx={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: '50%',
                        bgcolor: '#27c9a0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Typography sx={{ color: '#000', fontSize: '0.65rem', fontWeight: 900, lineHeight: 1 }}>✓</Typography>
                      </Box>
                    )}
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 1.5,
                      bgcolor: tColor(home), border: '1.5px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.75rem' }}>{tAbbr(home)}</Typography>
                    </Box>
                    <Typography sx={{
                      color: picked === home ? '#27c9a0' : '#c0c8da',
                      fontWeight: picked === home ? 700 : 500,
                      fontSize: '0.78rem', textAlign: 'center', lineHeight: 1.2,
                    }}>
                      {tName(home)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ bgcolor: '#0a0e1a', borderTop: '1px solid #161e30', p: 2 }}>
          <Button
            fullWidth variant="contained"
            onClick={() => setView('confirm')}
            disabled={!allMade}
            sx={{
              bgcolor: allMade ? '#27c9a0' : '#141928',
              color: allMade ? '#000' : '#2a3450',
              fontWeight: 900, letterSpacing: 2, py: 1.5, fontSize: '0.85rem',
              textTransform: 'uppercase',
              '&:hover': allMade ? { bgcolor: '#1db08e' } : {},
              '&.Mui-disabled': { bgcolor: '#141928', color: '#2a3450' },
            }}
          >
            Submit Predictions
          </Button>
        </Box>
      </Box>
    );
  }

  // ── WEEKS VIEW ────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e1a', display: 'flex', flexDirection: 'column', pb: 7 }}>

      <Box sx={{ bgcolor: '#0c1018', borderBottom: '1px solid #1a2035', px: 2, py: 1.4, display: 'flex', alignItems: 'center' }}>
        <Box
          onClick={() => { saveLS(LS_SESSION, null); router.replace('/'); }}
          sx={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', '&:hover': { bgcolor: '#1a2035' },
          }}
        >
          <ArrowBackIcon sx={{ color: '#c8d0e0', fontSize: 20 }} />
        </Box>
        <Typography sx={{ flex: 1, textAlign: 'center', color: '#e0e4f0', fontWeight: 700, fontSize: '1rem' }}>
          Season Weeks
        </Typography>
        <Box sx={{ width: 36 }} />
      </Box>

      <Box sx={{ flex: 1, px: 2, py: 2.5 }}>
        <Typography sx={{ color: '#4a5a7a', fontSize: '0.62rem', letterSpacing: 2, textTransform: 'uppercase', mb: 0.5 }}>
          Active Season
        </Typography>
        <Typography sx={{
          color: '#fff', fontWeight: 900, fontSize: '1.5rem',
          letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.1,
        }}>
          {activeSeason?.seasonName || '—'}
        </Typography>
        {activeSeason && (
          <Typography sx={{ color: '#4a5a7a', fontSize: '0.73rem', mt: 0.3 }}>
            {fmtRange(activeSeason.startDate, activeSeason.endDate)}
          </Typography>
        )}

        {seasonWeeks.length > 0 && (
          <Box sx={{ mt: 1.5, mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: '#3a4a6a', fontSize: '0.65rem' }}>
                {weekData.filter(d => d.state === 'completed').length} of {seasonWeeks.length} weeks completed
              </Typography>
              <Typography sx={{ color: '#27c9a0', fontSize: '0.65rem', fontWeight: 700 }}>
                {pickedWeeks}/{seasonWeeks.length} picked
              </Typography>
            </Box>
            <LinearProgress variant="determinate"
              value={seasonWeeks.length ? (pickedWeeks / seasonWeeks.length) * 100 : 0}
              sx={{ height: 3, borderRadius: 2, bgcolor: '#1a2035', '& .MuiLinearProgress-bar': { bgcolor: '#27c9a0' } }} />
          </Box>
        )}

        {seasonWeeks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: '#2a3450', fontSize: '0.9rem' }}>No weeks added for this season yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
            {weekData.map(({ w, state, games }) => (
              <WeekCard
                key={w.weekId}
                week={w}
                state={state}
                hasPicks={weekHasPicks(w.weekId)}
                correctCount={correctCount(w.weekId)}
                totalGames={games.length}
                onClick={() => openPicksView(w)}
              />
            ))}
          </Box>
        )}
      </Box>

      <BottomNavigation value={1} sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        bgcolor: '#0c1018', borderTop: '1px solid #1a2035', height: 56, zIndex: 20,
      }}>
        <BottomNavigationAction label="Home" icon={<HomeIcon />}
          onClick={() => { saveLS(LS_SESSION, null); router.replace('/'); }}
          sx={{ color: '#3a4a6a', '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem' }, minWidth: 0 }} />
        <BottomNavigationAction label="Weeks" icon={<CalendarMonthIcon />}
          sx={{ color: '#27c9a0', '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem', color: '#27c9a0' }, minWidth: 0 }} />
        <BottomNavigationAction label="Leaderboard" icon={<BarChartIcon />}
          onClick={() => setLbOpen(true)}
          sx={{ color: '#3a4a6a', '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem' }, minWidth: 0 }} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />}
          onClick={() => setProfileOpen(true)}
          sx={{ color: '#3a4a6a', '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem' }, minWidth: 0 }} />
      </BottomNavigation>

      <Dialog open={lbOpen} onClose={() => setLbOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#0d1220', border: '1px solid #1a2035', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#e8b84b', fontWeight: 900, borderBottom: '1px solid #1a2035', pb: 1.5, fontSize: '1rem' }}>
          Season Leaderboard
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          {leaderboard.length === 0
            ? <Typography sx={{ color: '#3a4a6a', textAlign: 'center', py: 2, fontSize: '0.85rem' }}>No data yet.</Typography>
            : leaderboard.map((r, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                py: 0.9, borderBottom: i < leaderboard.length - 1 ? '1px solid #141928' : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: i === 0 ? '#e8b84b' : '#3a4a6a', fontWeight: 900, fontSize: '0.78rem', width: 22 }}>{i + 1}</Typography>
                  <Typography sx={{ color: '#c0c8da', fontSize: '0.85rem' }}>{r.name}</Typography>
                </Box>
                <Typography sx={{ color: '#27c9a0', fontWeight: 700, fontSize: '0.85rem' }}>{r.correct} correct</Typography>
              </Box>
            ))}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1a2035' }}>
          <Button onClick={() => setLbOpen(false)} sx={{ color: '#e8b84b', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: '#0d1220', border: '1px solid #1a2035', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#e0e4f0', fontWeight: 900, borderBottom: '1px solid #1a2035', pb: 1.5, fontSize: '1rem' }}>
          My Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {[
            ['Name',         session.firstName + ' ' + session.lastName],
            ['Season',       activeSeason?.seasonName || '—'],
            ['Weeks Picked', pickedWeeks + ' / ' + seasonWeeks.length],
          ].map(([label, val]) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.7 }}>
              <Typography sx={{ color: '#4a5a7a', fontSize: '0.8rem' }}>{label}</Typography>
              <Typography sx={{ color: '#c0c8da', fontSize: '0.8rem', fontWeight: 700 }}>{val}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #1a2035' }}>
          <Button onClick={() => { saveLS(LS_SESSION, null); router.replace('/'); }} sx={{ color: '#ef5350', fontWeight: 700 }}>
            Logout
          </Button>
          <Button onClick={() => setProfileOpen(false)} sx={{ color: '#e8b84b', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
