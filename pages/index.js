import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, InputAdornment } from '@mui/material';
import LockOutlinedIcon   from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon  from '@mui/icons-material/PersonOutline';
import ArrowForwardIcon   from '@mui/icons-material/ArrowForward';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import { useRouter } from 'next/router';
import { loadLS, saveLS, LS_SESSION, LS_SEASONS, LS_PLAYERS, LS_ADMINS } from '../mock/store';

export default function LoginPage() {
  const router  = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [seasonYear, setSeasonYear] = useState('2026');

  useEffect(() => {
    saveLS(LS_SESSION, null);
    const seasons = loadLS(LS_SEASONS, []);
    const today   = new Date();
    const active  = seasons.find(s => {
      const start = new Date(s.startDate + 'T00:00:00');
      const end   = new Date(s.endDate   + 'T00:00:00');
      return today >= start && today <= end;
    }) || seasons[seasons.length - 1];
    if (active?.startDate) setSeasonYear(active.startDate.slice(0, 4));
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    const user = username.trim().toLowerCase();
    const pass = password;
    if (!user || !pass) { setError('Please enter your username and passcode.'); return; }

    const players = loadLS(LS_PLAYERS, []);
    const player  = players.find(p => p.email.toLowerCase() === user && p.password === pass);
    if (player) {
      saveLS(LS_SESSION, { type: 'player', playerId: player.playerId, employeeNumber: player.employeeNumber, firstName: player.firstName, lastName: player.lastName });
      router.push('/player');
      return;
    }

    const admins = loadLS(LS_ADMINS, []);
    const admin  = admins.find(a => a.email.toLowerCase() === user && a.password === pass);
    if (admin) {
      saveLS(LS_SESSION, { type: 'admin', adminId: admin.id, employeeNumber: admin.enumber, firstName: admin.nameFirst, lastName: admin.nameLast });
      router.push('/admin');
      return;
    }

    setError('Invalid username or passcode.');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#060c1a 0%,#0d1630 40%,#060c1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2,
    }}>
      <Box sx={{
        width: '100%', maxWidth: 340,
        background: 'rgba(10,16,32,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Hero */}
        <Box sx={{
          background: 'linear-gradient(180deg,#0a1428 0%,#111e3a 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pt: 4, pb: 3, px: 3,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Box sx={{
            width: 68, height: 68, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
          }}>
            <SportsFootballIcon sx={{ fontSize: 34, color: '#fff' }} />
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.1 }}>
            NFL Season
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', mt: 0.3 }}>
            {seasonYear}
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ px: 3, py: 3 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', mb: 2.5, letterSpacing: 0.5 }}>
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', mb: 0.5, letterSpacing: 0.5 }}>Username</Typography>
              <TextField fullWidth size="small" placeholder="Enter your username"
                value={username} onChange={e => { setUsername(e.target.value); setError(''); }} autoFocus
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} /></InputAdornment> }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 1.5, fontSize: '0.85rem',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                    '&.Mui-focused fieldset': { borderColor: '#2979ff' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 },
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', mb: 0.5, letterSpacing: 0.5 }}>Passcode</Typography>
              <TextField fullWidth size="small" type="password" placeholder="Enter your passcode"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} /></InputAdornment> }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 1.5, fontSize: '0.85rem',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                    '&.Mui-focused fieldset': { borderColor: '#2979ff' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 },
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'right', mt: -0.5 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', cursor: 'default' }}>Forgot Passcode?</Typography>
            </Box>

            {error && (
              <Typography sx={{ color: '#ff6b6b', fontSize: '0.78rem', textAlign: 'center', mt: -0.5 }}>{error}</Typography>
            )}

            <Button type="submit" fullWidth sx={{
              mt: 0.5, borderRadius: 50,
              bgcolor: '#2979ff', color: '#fff',
              py: 0.8, pl: 2.5, pr: 1,
              fontWeight: 700, fontSize: '0.9rem', letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              textTransform: 'none', '&:hover': { bgcolor: '#1565c0' },
            }}>
              <Box sx={{ flex: 1, textAlign: 'center', mr: -4 }}>Swipe to Login</Box>
              <Box sx={{
                width: 38, height: 38, borderRadius: '50%', bgcolor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowForwardIcon sx={{ color: '#2979ff', fontSize: 20 }} />
              </Box>
            </Button>
          </Box>

          {/* Sample credentials */}
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', textAlign: 'center', mb: 1.2, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Sample Credentials
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{
                flex: 1, bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 1.5, p: 1.2, textAlign: 'center',
              }}>
                <Typography sx={{ color: '#27c9a0', fontSize: '0.65rem', fontWeight: 700, mb: 0.6, letterSpacing: 0.5 }}>Player</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', display: 'block', lineHeight: 1.7 }}>
                  read@example.com
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', display: 'block' }}>
                  pass1
                </Typography>
              </Box>
              <Box sx={{
                flex: 1, bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 1.5, p: 1.2, textAlign: 'center',
              }}>
                <Typography sx={{ color: '#e8b84b', fontSize: '0.65rem', fontWeight: 700, mb: 0.6, letterSpacing: 0.5 }}>Admin</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', display: 'block', lineHeight: 1.7 }}>
                  mvenkata@example.com
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', display: 'block' }}>
                  admin123
                </Typography>
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
