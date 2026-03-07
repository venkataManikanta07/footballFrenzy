import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  InputLabel,
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/RemoveCircle';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// Mock initial admins data
const initialAdmins = [
  {
    id: 'a1',
    nameFirst: 'Joshi',
    nameLast: 'Keyur',
    enumber: '1',
    badgeNo: '112234',
    jobTitle: 'Business Analyst',
    department: 'Business',
    phoneNumber: '509-555-0100',
    cell: '509-555-0101',
    email: 'KJoshi@Ktea.Com',
    adminLevel: 1,
    fml: true,
  },
  {
    id: 'a2',
    nameFirst: 'Vanama',
    nameLast: 'Sai',
    enumber: '3',
    badgeNo: '111113',
    jobTitle: 'Azure',
    department: 'IT',
    phoneNumber: '',
    cell: '',
    email: 'SVanama@Ktea.Com',
    adminLevel: 2,
    fml: false,
  },
  {
    id: 'a3',
    nameFirst: 'Peltier',
    nameLast: 'Dwight',
    enumber: '4034',
    badgeNo: '100305',
    jobTitle: 'Information Security',
    department: 'Accounting',
    phoneNumber: '509-720-4700',
    cell: '',
    email: 'Dpeltier@Northernquest.Co',
    adminLevel: 2,
    fml: false,
  },
];

// Mock people dataset for lookup
const mockPeople = [
  { id: 'p1', firstName: 'John', lastName: 'Delange', enumber: '111957', badgeNo: '10375', jobTitle: 'Masselows Cook I', department: 'Masselows BOH', email: 'j.delange@example.com' },
  { id: 'p2', firstName: 'John', lastName: 'Cappellano', enumber: '100347', badgeNo: '60446', jobTitle: 'EMT', department: 'EMS South', email: 'j.cappellano@example.com' },
  { id: 'p3', firstName: 'Johnny', lastName: 'DuBrock', enumber: '119912', badgeNo: '16209', jobTitle: 'Venue Manager', department: 'Casino Floor', email: '' },
  { id: 'p4', firstName: 'John', lastName: 'Im', enumber: '107508', badgeNo: '7575', jobTitle: 'Pit Manager', department: 'NQRC Table Games', email: 'john.im@example.com' },
  { id: 'p5', firstName: 'Taylor', lastName: 'DeAnne', enumber: '5800', badgeNo: '104446', jobTitle: 'Payroll Specialist', department: 'NQRC Accounting', email: '' },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [filters, setFilters] = useState({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isLookupOpen, setLookupOpen] = useState(false);
  const [lookupFirst, setLookupFirst] = useState('');
  const [lookupLast, setLookupLast] = useState('');
  const [lookupResults, setLookupResults] = useState([]);

  // Filtered data derived from admins and filters
  const filtered = useMemo(() => {
    return admins.filter((r) => {
      if (filters.lastName && !r.nameLast.toLowerCase().includes(filters.lastName.toLowerCase())) return false;
      if (filters.firstName && !r.nameFirst.toLowerCase().includes(filters.firstName.toLowerCase())) return false;
      if (filters.employeeNumber && !r.enumber.toString().includes(filters.employeeNumber)) return false;
      if (filters.badgeNumber && !r.badgeNo.toString().includes(filters.badgeNumber)) return false;
      return true;
    });
  }, [admins, filters]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  // Filter input handlers
  const handleFilterChange = (name) => (e) => {
    setFilters((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleClear = () => {
    setFilters({ lastName: '', firstName: '', employeeNumber: '', badgeNumber: '' });
    setRowsPerPage(20);
  };

  // Delete flow
  const confirmDelete = (row) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };
  const performDelete = () => {
    if (deleteTarget) {
      setAdmins((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // Lookup modal: simple client-side search when >=3 chars
  useEffect(() => {
    const q = (lookupFirst || lookupLast).trim();
    if (q.length >= 3) {
      const res = mockPeople.filter((p) => {
        const fn = p.firstName.toLowerCase();
        const ln = p.lastName.toLowerCase();
        const ql = q.toLowerCase();
        return fn.includes(ql) || ln.includes(ql);
      });
      setLookupResults(res);
    } else {
      setLookupResults([]);
    }
  }, [lookupFirst, lookupLast]);

  const addAdminFromLookup = (person) => {
    const newAdmin = {
      id: `a-${Date.now()}`,
      nameFirst: person.firstName,
      nameLast: person.lastName,
      enumber: person.enumber,
      badgeNo: person.badgeNo,
      jobTitle: person.jobTitle,
      department: person.department,
      phoneNumber: '',
      cell: '',
      email: person.email,
      adminLevel: 2,
      fml: !!person.email,
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setLookupOpen(false);
    setLookupFirst('');
    setLookupLast('');
  };

  // Render
  return (
    <AdminLayout>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom color="primary">Admins</Typography>
          <Button variant="contained" color="primary" onClick={() => setLookupOpen(true)}>NEW ADMIN</Button>
        </Box>

        <Grid container spacing={2} mb={1}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Last Name"
              value={filters.lastName}
              onChange={handleFilterChange('lastName')}
              placeholder="Last Name"
              sx={{ '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none' } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="First Name"
              value={filters.firstName}
              onChange={handleFilterChange('firstName')}
              placeholder="First Name"
              sx={{ '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none' } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Employee#"
              value={filters.employeeNumber}
              onChange={handleFilterChange('employeeNumber')}
              placeholder="Employee#"
              sx={{ '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none' } }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Badge#"
              value={filters.badgeNumber}
              onChange={handleFilterChange('badgeNumber')}
              placeholder="Badge#"
              sx={{ '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none' } }}
            />
          </Grid>
        </Grid>

        {/* Second row: place Clear button aligned to the right under inputs */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button sx={{ mt: 1 }} variant="outlined" onClick={handleClear}>CLEAR</Button>
            </Box>
          </Grid>
        </Grid>

        <Box mb={1}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>NOTES: </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#bfe6e6' }}>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Employee# / Badge#</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Job Title / Department</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>FML</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Level</TableCell>
              <TableCell sx={{ color: '#064e4e', fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nameFirst} {row.nameLast}</TableCell>
                <TableCell>{row.enumber} {row.badgeNo ? `/ ${row.badgeNo}` : ''}</TableCell>
                <TableCell>{row.jobTitle} {row.department ? `/ ${row.department}` : ''}</TableCell>
                <TableCell>
                  <div>W: {row.phoneNumber}</div>
                  <div>C: {row.cell}</div>
                </TableCell>
                <TableCell>
                  {row.email ? (
                    <a href={`mailto:${row.email}`}>{row.email}</a>
                  ) : '--'}
                </TableCell>
                <TableCell>
                  <Checkbox checked={!!row.fml} onChange={(e) => setAdmins((prev) => prev.map((p) => p.id === row.id ? { ...p, fml: e.target.checked } : p))} />
                </TableCell>
                <TableCell>
                  <FormControl size="small">
                    <InputLabel id={`lvl-${row.id}`}>Level</InputLabel>
                    <Select
                      labelId={`lvl-${row.id}`}
                      value={row.adminLevel}
                      label="Level"
                      onChange={(e) => setAdmins((prev) => prev.map((p) => p.id === row.id ? { ...p, adminLevel: Number(e.target.value) } : p))}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => confirmDelete(row)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />

        
      </Paper>

      {/* Delete dialog */}
      <Dialog open={isDeleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>No</Button>
          <Button color="error" onClick={performDelete}>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Lookup dialog */}
      <Dialog open={isLookupOpen} onClose={() => setLookupOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Look Up</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" value={lookupLast} onChange={(e) => setLookupLast(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" value={lookupFirst} onChange={(e) => setLookupFirst(e.target.value)} />
            </Grid>
          </Grid>

          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>First</TableCell>
                  <TableCell>Last</TableCell>
                  <TableCell>Employee#</TableCell>
                  <TableCell>Badge#</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell>Dept</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lookupResults.map((p) => (
                  <TableRow key={p.id} hover onClick={() => addAdminFromLookup(p)} style={{ cursor: 'pointer' }}>
                    <TableCell>{p.firstName}</TableCell>
                    <TableCell>{p.lastName}</TableCell>
                    <TableCell>{p.enumber}</TableCell>
                    <TableCell>{p.badgeNo}</TableCell>
                    <TableCell>{p.jobTitle}</TableCell>
                    <TableCell>{p.department}</TableCell>
                    <TableCell>{p.email ? <MailOutlineIcon color="success" /> : <MailOutlineIcon color="disabled" />}</TableCell>
                  </TableRow>
                ))}
                {lookupResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}><Typography variant="body2" sx={{ p: 2 }}>Start typing at least 3 letters in either First Name or Last Name to initiate the search.</Typography></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLookupOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
