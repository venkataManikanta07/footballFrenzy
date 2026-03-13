import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box, Grid, Typography, TextField, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TablePagination, InputLabel,
  FormControl, Chip, Avatar, Tooltip, Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon   from '@mui/icons-material/Edit';
import AddIcon    from '@mui/icons-material/Add';
import {
  LS_ADMINS, loadLS, saveLS, INITIAL_ADMINS,
} from '../../mock/store';

const TH = { backgroundColor: '#bfe6e6', color: '#064e4e', fontWeight: 700 };

const emptyAdmin = {
  nameFirst: '', nameLast: '', enumber: '', badgeNo: '',
  jobTitle: '', department: '', email: '', adminLevel: 2,
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);

  const [searchLast,  setSearchLast]  = useState('');
  const [searchFirst, setSearchFirst] = useState('');
  const [searchEmp,   setSearchEmp]   = useState('');
  const [searchBadge, setSearchBadge] = useState('');

  const [page,        setPage]        = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // New / Edit dialog
  const [adminDialog,  setAdminDialog]  = useState(false);
  const [adminForm,    setAdminForm]    = useState(emptyAdmin);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formErrors,   setFormErrors]   = useState({});

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  // ─── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setAdmins(loadLS(LS_ADMINS, INITIAL_ADMINS));
  }, []);

  // ─── Persist helper ────────────────────────────────────────────────────────
  function persist(updated) {
    saveLS(LS_ADMINS, updated);
    setAdmins(updated);
  }

  // ─── Filters ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => admins.filter(r => {
    if (searchLast  && !r.nameLast.toLowerCase().includes(searchLast.toLowerCase()))   return false;
    if (searchFirst && !r.nameFirst.toLowerCase().includes(searchFirst.toLowerCase())) return false;
    if (searchEmp   && !String(r.enumber).includes(searchEmp))                         return false;
    if (searchBadge && !String(r.badgeNo).includes(searchBadge))                       return false;
    return true;
  }), [admins, searchLast, searchFirst, searchEmp, searchBadge]);

  // ─── Admin Level inline change ─────────────────────────────────────────────
  function changeLevel(id, level) {
    persist(admins.map(a => a.id === id ? { ...a, adminLevel: level } : a));
  }

  // ─── New / Edit ────────────────────────────────────────────────────────────
  function openNew() {
    setAdminForm(emptyAdmin);
    setEditingAdmin(null);
    setFormErrors({});
    setAdminDialog(true);
  }

  function openEdit(admin) {
    setAdminForm({
      nameFirst:  admin.nameFirst,
      nameLast:   admin.nameLast,
      enumber:    admin.enumber,
      badgeNo:    admin.badgeNo,
      jobTitle:   admin.jobTitle,
      department: admin.department,
      email:      admin.email,
      adminLevel: admin.adminLevel,
    });
    setEditingAdmin(admin);
    setFormErrors({});
    setAdminDialog(true);
  }

  function validateAdmin() {
    const e = {};
    if (!adminForm.nameFirst.trim()) e.nameFirst = 'Required';
    if (!adminForm.enumber.trim())   e.enumber   = 'Required';
    return e;
  }

  function saveAdmin() {
    const e = validateAdmin();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    let updated;
    if (editingAdmin) {
      updated = admins.map(a => a.id === editingAdmin.id ? { ...a, ...adminForm } : a);
    } else {
      updated = [...admins, { id: `a${Date.now()}`, ...adminForm }];
    }
    persist(updated);
    setAdminDialog(false);
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  function confirmDelete(admin) { setAdminToDelete(admin); setDeleteDialog(true); }
  function deleteAdmin() {
    persist(admins.filter(a => a.id !== adminToDelete.id));
    setDeleteDialog(false);
    setAdminToDelete(null);
  }

  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#064e4e' }}>Admin Management</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${filtered.length} admin${filtered.length !== 1 ? 's' : ''}`}
              sx={{ bgcolor: '#e0f7f7', color: '#064e4e', fontWeight: 600 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openNew}
              sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}
            >
              New Admin
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Last Name</Typography>
            <TextField fullWidth size="small" placeholder="Last Name"
              value={searchLast} onChange={e => { setSearchLast(e.target.value); setPage(0); }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>First Name</Typography>
            <TextField fullWidth size="small" placeholder="First Name"
              value={searchFirst} onChange={e => { setSearchFirst(e.target.value); setPage(0); }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Employee#</Typography>
            <TextField fullWidth size="small" placeholder="Employee#"
              value={searchEmp} onChange={e => { setSearchEmp(e.target.value); setPage(0); }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#555', display: 'block', mb: 0.5 }}>Badge#</Typography>
            <TextField fullWidth size="small" placeholder="Badge#"
              value={searchBadge} onChange={e => { setSearchBadge(e.target.value); setPage(0); }} />
          </Box>
          <Button variant="outlined"
            onClick={() => { setSearchLast(''); setSearchFirst(''); setSearchEmp(''); setSearchBadge(''); setPage(0); }}
            sx={{ ml: 'auto', borderColor: '#008b8b', color: '#008b8b', alignSelf: 'flex-end' }}
          >
            CLEAR
          </Button>
        </Box>

        {/* Table */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={TH}>Name</TableCell>
              <TableCell sx={TH}>Employee # / Badge #</TableCell>
              <TableCell sx={TH}>Job Title / Department</TableCell>
              <TableCell sx={TH}>Email</TableCell>
              <TableCell sx={TH} align="center">Level</TableCell>
              <TableCell sx={TH} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: '#008b8b', fontSize: 13 }}>
                      {row.nameFirst?.[0]}{row.nameLast?.[0]}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.nameFirst} {row.nameLast}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.enumber}</Typography>
                  {row.badgeNo && (
                    <Typography variant="caption" sx={{ color: '#888' }}>Badge: {row.badgeNo}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.jobTitle}</Typography>
                  {row.department && (
                    <Typography variant="caption" sx={{ color: '#888' }}>{row.department}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.email
                    ? <a href={`mailto:${row.email}`} style={{ color: '#008b8b' }}>{row.email}</a>
                    : <Typography variant="caption" sx={{ color: '#aaa' }}>—</Typography>}
                </TableCell>
                <TableCell align="center">
                  <FormControl size="small" sx={{ minWidth: 72 }}>
                    <Select
                      value={row.adminLevel}
                      onChange={e => changeLevel(row.id, Number(e.target.value))}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center">
                    <Tooltip title="Edit Admin">
                      <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: '#555' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Admin">
                      <IconButton size="small" onClick={() => confirmDelete(row)} sx={{ color: '#d32f2f' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>No admins found.</TableCell>
              </TableRow>
            )}
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

      {/* New / Edit Admin Dialog */}
      <Dialog open={adminDialog} onClose={() => setAdminDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#064e4e', color: '#fff' }}>
          {editingAdmin ? 'Edit Admin' : 'New Admin'}
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="First Name *"
                value={adminForm.nameFirst}
                onChange={e => setAdminForm(f => ({ ...f, nameFirst: e.target.value }))}
                error={!!formErrors.nameFirst} helperText={formErrors.nameFirst} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Last Name"
                value={adminForm.nameLast}
                onChange={e => setAdminForm(f => ({ ...f, nameLast: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Employee # *"
                value={adminForm.enumber}
                onChange={e => setAdminForm(f => ({ ...f, enumber: e.target.value }))}
                error={!!formErrors.enumber} helperText={formErrors.enumber} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Badge #"
                value={adminForm.badgeNo}
                onChange={e => setAdminForm(f => ({ ...f, badgeNo: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Job Title"
                value={adminForm.jobTitle}
                onChange={e => setAdminForm(f => ({ ...f, jobTitle: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Department"
                value={adminForm.department}
                onChange={e => setAdminForm(f => ({ ...f, department: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Email"
                value={adminForm.email}
                onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Admin Level</InputLabel>
                <Select
                  value={adminForm.adminLevel}
                  label="Admin Level"
                  onChange={e => setAdminForm(f => ({ ...f, adminLevel: Number(e.target.value) }))}
                >
                  <MenuItem value={1}>Level 1</MenuItem>
                  <MenuItem value={2}>Level 2</MenuItem>
                  <MenuItem value={3}>Level 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveAdmin}
            sx={{ bgcolor: '#008b8b', '&:hover': { bgcolor: '#006f6f' } }}>
            {editingAdmin ? 'Update' : 'Add Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Admin?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {adminToDelete?.nameFirst} {adminToDelete?.nameLast} from admin access?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteAdmin}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
