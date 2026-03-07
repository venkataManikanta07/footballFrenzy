import React from 'react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Avatar, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 260;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const menuItems = [
    { key: 'Seasons', icon: <InboxIcon />, path: '/admin/seasons' },
    { key: 'Teams', icon: <BusinessIcon />, path: '/admin/teams' },
    { key: 'Weeks', icon: <CalendarTodayIcon />, path: '/admin/weeks' },
    { key: 'Players', icon: <PeopleIcon />, path: '/admin/players' },
    { key: 'Admins', icon: <AdminPanelSettingsIcon />, path: '/admin/admins' },
  ];

  const currentPath = router.pathname;
  const selected = (menuItems.find((m) => currentPath.startsWith(m.path)) || menuItems[0]).key;

  const handleNav = (path) => {
    router.push(path);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#008b8b' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Football Frenzy
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Avatar sx={{ bgcolor: '#ffffff', color: '#008b8b' }}>KJ</Avatar>
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
          {menuItems.map((m) => (
            <ListItemButton key={m.key} selected={selected === m.key} onClick={() => handleNav(m.path)} sx={{ py: 1.5 }}>
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
