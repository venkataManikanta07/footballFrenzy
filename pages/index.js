import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/router';

// full-screen background container
const Background = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: 'url(/nfl.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#000', // fallback if the image is missing
  zIndex: -1,
  // Note: put your `nfl.jpg` file into the `public` folder; see README
});

const LoginContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: 380,
  maxWidth: '92%',
  textAlign: 'center',
  borderRadius: 12,
  backdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(0,0,0,0.36)', // semi-transparent dark container
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.08)'
}));

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState('player');
  const [message, setMessage] = React.useState('');

  const handleNavigate = (targetRole, username) => {
    // navigate to target route without authentication (POC / mock flow)
    const path = targetRole === 'admin' ? '/admin' : '/player';
    router.push({ pathname: path, query: { user: username || '' } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const username = data.get('username');
    if (!username) {
      setMessage('Please enter a username');
      return;
    }
    setMessage('');
    handleNavigate(role, username);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Background />
      <LoginContainer elevation={6}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Football Frenzy
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'rgba(255,255,255,0.85)' }}>
          Choose your mode to continue
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push('/player')}
            sx={{ py: 1.8, textTransform: 'none', fontSize: 16 }}
          >
            Enter as Player
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => router.push('/admin')}
            sx={{ py: 1.8, textTransform: 'none', fontSize: 16, borderColor: 'rgba(255,255,255,0.18)', color: '#fff' }}
          >
            Enter as Admin
          </Button>
        </Box>
      </LoginContainer>
    </Box>
  );
}
