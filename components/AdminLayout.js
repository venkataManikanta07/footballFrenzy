import React from 'react';
import { useRouter } from 'next/router';
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, Divider, Menu, MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { loadLS, saveLS, LS_SESSION } from '../mock/store';

const drawerWidth = 260;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [open, setOpen]             = React.useState(true);
  const [session, setSession]       = React.useState(null);
  const [anchorEl, setAnchorEl]     = React.useState(null);

  React.useEffect(() => {
    const sess = loadLS(LS_SESSION, null);
    if (!sess || sess.type !== 'admin') {
      router.replace('/');
      return;
    }
    setSession(sess);
  }, []);

  const initials = session
    ? `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase()
    : '??';

  const handleLogout = () => {
    setAnchorEl(null);
    saveLS(LS_SESSION, null);
    router.replace('/');
  };

  const menuItems = [
    { key: 'Seasons', icon: <InboxIcon />,              path: '/admin/seasons' },
    { key: 'Teams',   icon: <BusinessIcon />,           path: '/admin/teams'   },
    { key: 'Weeks',   icon: <CalendarTodayIcon />,      path: '/admin/weeks'   },
    { key: 'Players', icon: <PeopleIcon />,             path: '/admin/players' },
    { key: 'Admins',  icon: <AdminPanelSettingsIcon />, path: '/admin/admins'  },
  ];

  const currentPath = router.pathname;
  const selected = (menuItems.find(m => currentPath.startsWith(m.path)) || menuItems[0]).key;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1, backgroundColor: '#008b8b' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Football Frenzy
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Avatar
            onClick={e => setAnchorEl(e.currentTarget)}
            sx={{ bgcolor: '#fff', color: '#008b8b', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            {initials}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {session && (
              <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
                {session.firstName} {session.lastName}
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            background: '#ffffff',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map(m => (
            <ListItemButton
              key={m.key}
              selected={selected === m.key}
              onClick={() => router.push(m.path)}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{m.icon}</ListItemIcon>
              {open && <ListItemText primary={m.key} />}
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', ml: open ? '24px' : '72px' }}>
        {children}
      </Box>
    </Box>
  );
}
