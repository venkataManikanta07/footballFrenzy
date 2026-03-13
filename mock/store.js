// ─── Football Frenzy — Central Data Store ────────────────────────────────────
// Single source of truth for localStorage keys, seed data, and helpers.

// ─── localStorage keys ───────────────────────────────────────────────────────
export const LS_SEASONS = 'ff_seasons';
export const LS_TEAMS   = 'ff_teams';
export const LS_WEEKS   = 'ff_weeks';
export const LS_GAMES   = 'ff_games';
export const LS_PLAYERS = 'ff_players';
export const LS_ADMINS  = 'ff_admins';
export const LS_PICKS   = 'ff_picks';
export const LS_SESSION = 'ff_session';

// ─── localStorage helpers ─────────────────────────────────────────────────────
export function loadLS(key, fallback) {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Date helper ──────────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── 32 NFL teams ─────────────────────────────────────────────────────────────
export const NFL_TEAMS_BASE = [
  { teamId: 'nfl1',  teamName: 'Cardinals',   teamCity: 'Arizona',       abbr: 'ARI', color: '#97233F' },
  { teamId: 'nfl2',  teamName: 'Falcons',      teamCity: 'Atlanta',       abbr: 'ATL', color: '#A71930' },
  { teamId: 'nfl3',  teamName: 'Ravens',       teamCity: 'Baltimore',     abbr: 'BAL', color: '#241773' },
  { teamId: 'nfl4',  teamName: 'Bills',        teamCity: 'Buffalo',       abbr: 'BUF', color: '#00338D' },
  { teamId: 'nfl5',  teamName: 'Panthers',     teamCity: 'Carolina',      abbr: 'CAR', color: '#0085CA' },
  { teamId: 'nfl6',  teamName: 'Bears',        teamCity: 'Chicago',       abbr: 'CHI', color: '#0B162A' },
  { teamId: 'nfl7',  teamName: 'Bengals',      teamCity: 'Cincinnati',    abbr: 'CIN', color: '#FB4F14' },
  { teamId: 'nfl8',  teamName: 'Browns',       teamCity: 'Cleveland',     abbr: 'CLE', color: '#311D00' },
  { teamId: 'nfl9',  teamName: 'Cowboys',      teamCity: 'Dallas',        abbr: 'DAL', color: '#003594' },
  { teamId: 'nfl10', teamName: 'Broncos',      teamCity: 'Denver',        abbr: 'DEN', color: '#FB4F14' },
  { teamId: 'nfl11', teamName: 'Lions',        teamCity: 'Detroit',       abbr: 'DET', color: '#0076B6' },
  { teamId: 'nfl12', teamName: 'Packers',      teamCity: 'Green Bay',     abbr: 'GB',  color: '#203731' },
  { teamId: 'nfl13', teamName: 'Texans',       teamCity: 'Houston',       abbr: 'HOU', color: '#03202F' },
  { teamId: 'nfl14', teamName: 'Colts',        teamCity: 'Indianapolis',  abbr: 'IND', color: '#002C5F' },
  { teamId: 'nfl15', teamName: 'Jaguars',      teamCity: 'Jacksonville',  abbr: 'JAX', color: '#006778' },
  { teamId: 'nfl16', teamName: 'Chiefs',       teamCity: 'Kansas City',   abbr: 'KC',  color: '#E31837' },
  { teamId: 'nfl17', teamName: 'Raiders',      teamCity: 'Las Vegas',     abbr: 'LV',  color: '#000000' },
  { teamId: 'nfl18', teamName: 'Chargers',     teamCity: 'Los Angeles',   abbr: 'LAC', color: '#0080C6' },
  { teamId: 'nfl19', teamName: 'Rams',         teamCity: 'Los Angeles',   abbr: 'LAR', color: '#003594' },
  { teamId: 'nfl20', teamName: 'Dolphins',     teamCity: 'Miami',         abbr: 'MIA', color: '#008E97' },
  { teamId: 'nfl21', teamName: 'Vikings',      teamCity: 'Minnesota',     abbr: 'MIN', color: '#4F2683' },
  { teamId: 'nfl22', teamName: 'Patriots',     teamCity: 'New England',   abbr: 'NE',  color: '#002244' },
  { teamId: 'nfl23', teamName: 'Saints',       teamCity: 'New Orleans',   abbr: 'NO',  color: '#9D8353' },
  { teamId: 'nfl24', teamName: 'Giants',       teamCity: 'New York',      abbr: 'NYG', color: '#0B2265' },
  { teamId: 'nfl25', teamName: 'Jets',         teamCity: 'New York',      abbr: 'NYJ', color: '#125740' },
  { teamId: 'nfl26', teamName: 'Eagles',       teamCity: 'Philadelphia',  abbr: 'PHI', color: '#004C54' },
  { teamId: 'nfl27', teamName: 'Steelers',     teamCity: 'Pittsburgh',    abbr: 'PIT', color: '#FFB612' },
  { teamId: 'nfl28', teamName: '49ers',        teamCity: 'San Francisco', abbr: 'SF',  color: '#AA0000' },
  { teamId: 'nfl29', teamName: 'Seahawks',     teamCity: 'Seattle',       abbr: 'SEA', color: '#002244' },
  { teamId: 'nfl30', teamName: 'Buccaneers',   teamCity: 'Tampa Bay',     abbr: 'TB',  color: '#D50A0A' },
  { teamId: 'nfl31', teamName: 'Titans',       teamCity: 'Tennessee',     abbr: 'TEN', color: '#0C2340' },
  { teamId: 'nfl32', teamName: 'Commanders',   teamCity: 'Washington',    abbr: 'WAS', color: '#5A1414' },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

// Bump DATA_VERSION in _app.js to force a re-seed of all localStorage data.

export const INITIAL_SEASONS = [
  { seasonId: 's1', seasonName: 'Season 2024-25', startDate: '2024-09-05', endDate: '2025-02-09', status: 'completed' },
  { seasonId: 's2', seasonName: 'Season 2025-26', startDate: '2025-09-04', endDate: '2026-02-08', status: 'completed' },
  { seasonId: 's3', seasonName: 'Season 2026-27', startDate: '2026-02-01', endDate: '2026-12-31', status: 'active'    },
];

export const INITIAL_TEAMS = INITIAL_SEASONS.flatMap((season) =>
  NFL_TEAMS_BASE.map((t) => ({
    id: `${season.seasonId}-${t.teamId}`,
    teamId:   t.teamId,
    teamName: t.teamName,
    teamCity: t.teamCity,
    abbr:     t.abbr,
    color:    t.color,
    seasonId: season.seasonId,
  }))
);

export const INITIAL_WEEKS = [
  // Season 2026-27 (s3)
  { weekId: 'w1', seasonId: 's3', weekNumber: 1, startDate: '2026-02-01', endDate: '2026-02-07' },
  { weekId: 'w2', seasonId: 's3', weekNumber: 2, startDate: '2026-02-15', endDate: '2026-02-21' },
  { weekId: 'w3', seasonId: 's3', weekNumber: 3, startDate: '2026-03-08', endDate: '2026-03-14' }, // current week
  { weekId: 'w4', seasonId: 's3', weekNumber: 4, startDate: '2026-03-22', endDate: '2026-03-28' },
  { weekId: 'w5', seasonId: 's3', weekNumber: 5, startDate: '2026-04-05', endDate: '2026-04-11' },
  { weekId: 'w6', seasonId: 's3', weekNumber: 6, startDate: '2026-04-19', endDate: '2026-04-25' },
];

export const INITIAL_GAMES = [
  // Week 1 — completed, results set
  { gameId: 'g1', weekId: 'w1', homeTeamId: 'nfl9',  awayTeamId: 'nfl26', gameDate: '2026-02-01', homeScore: 28, awayScore: 17, winnerTeamId: 'nfl9'  },
  { gameId: 'g2', weekId: 'w1', homeTeamId: 'nfl12', awayTeamId: 'nfl6',  gameDate: '2026-02-02', homeScore: 24, awayScore: 21, winnerTeamId: 'nfl12' },
  { gameId: 'g3', weekId: 'w1', homeTeamId: 'nfl21', awayTeamId: 'nfl4',  gameDate: '2026-02-02', homeScore: 14, awayScore: 38, winnerTeamId: 'nfl4'  },
  // Week 2 — completed, results set
  { gameId: 'g4', weekId: 'w2', homeTeamId: 'nfl27', awayTeamId: 'nfl9',  gameDate: '2026-02-15', homeScore: 31, awayScore: 20, winnerTeamId: 'nfl27' },
  { gameId: 'g5', weekId: 'w2', homeTeamId: 'nfl25', awayTeamId: 'nfl21', gameDate: '2026-02-16', homeScore: 10, awayScore: 27, winnerTeamId: 'nfl21' },
  { gameId: 'g6', weekId: 'w2', homeTeamId: 'nfl16', awayTeamId: 'nfl28', gameDate: '2026-02-16', homeScore: 35, awayScore: 17, winnerTeamId: 'nfl16' },
  // Week 3 — LIVE (current week, no results yet)
  { gameId: 'g7',  weekId: 'w3', homeTeamId: 'nfl25', awayTeamId: 'nfl21', gameDate: '2026-03-08', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g8',  weekId: 'w3', homeTeamId: 'nfl4',  awayTeamId: 'nfl28', gameDate: '2026-03-09', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g9',  weekId: 'w3', homeTeamId: 'nfl9',  awayTeamId: 'nfl30', gameDate: '2026-03-09', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g10', weekId: 'w3', homeTeamId: 'nfl16', awayTeamId: 'nfl7',  gameDate: '2026-03-10', homeScore: null, awayScore: null, winnerTeamId: null },
  // Week 4 — upcoming, games added
  { gameId: 'g11', weekId: 'w4', homeTeamId: 'nfl12', awayTeamId: 'nfl27', gameDate: '2026-03-22', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g12', weekId: 'w4', homeTeamId: 'nfl6',  awayTeamId: 'nfl11', gameDate: '2026-03-23', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g13', weekId: 'w4', homeTeamId: 'nfl2',  awayTeamId: 'nfl22', gameDate: '2026-03-23', homeScore: null, awayScore: null, winnerTeamId: null },
  // Week 5 — upcoming, games added
  { gameId: 'g14', weekId: 'w5', homeTeamId: 'nfl30', awayTeamId: 'nfl4',  gameDate: '2026-04-05', homeScore: null, awayScore: null, winnerTeamId: null },
  { gameId: 'g15', weekId: 'w5', homeTeamId: 'nfl26', awayTeamId: 'nfl24', gameDate: '2026-04-06', homeScore: null, awayScore: null, winnerTeamId: null },
  // Week 6 — locked (no games yet)
];

export const INITIAL_PICKS = [
  // Player p1 — Week 1 picks (2/3 correct)
  { pickId: 'pk_p1_g1', playerId: 'p1', weekId: 'w1', gameId: 'g1', pickedTeamId: 'nfl9'  },
  { pickId: 'pk_p1_g2', playerId: 'p1', weekId: 'w1', gameId: 'g2', pickedTeamId: 'nfl12' },
  { pickId: 'pk_p1_g3', playerId: 'p1', weekId: 'w1', gameId: 'g3', pickedTeamId: 'nfl16' },
  { pickId: 'pk_p1_g4', playerId: 'p1', weekId: 'w2', gameId: 'g4', pickedTeamId: 'nfl27' },
  { pickId: 'pk_p1_g5', playerId: 'p1', weekId: 'w2', gameId: 'g5', pickedTeamId: 'nfl25' },
  { pickId: 'pk_p1_g6', playerId: 'p1', weekId: 'w2', gameId: 'g6', pickedTeamId: 'nfl16' },
  // Player p2 — Week 1 picks (1/3 correct)
  { pickId: 'pk_p2_g1', playerId: 'p2', weekId: 'w1', gameId: 'g1', pickedTeamId: 'nfl26' },
  { pickId: 'pk_p2_g2', playerId: 'p2', weekId: 'w1', gameId: 'g2', pickedTeamId: 'nfl12' },
  { pickId: 'pk_p2_g3', playerId: 'p2', weekId: 'w1', gameId: 'g3', pickedTeamId: 'nfl4'  },
];

export const INITIAL_PLAYERS = [
  { playerId: 'p1', employeeNumber: '3413', firstName: 'Read',     lastName: 'Drexel',      email: 'read@example.com',    badgeNumber: '101018', password: 'pass1' },
  { playerId: 'p2', employeeNumber: '7898', firstName: 'James',    lastName: 'Mercer',      email: 'james@example.com',   badgeNumber: '108047', password: 'pass2' },
  { playerId: 'p3', employeeNumber: '5109', firstName: 'Lawrence', lastName: 'Lee',         email: 'lawrence@example.com',badgeNumber: '103503', password: 'pass3' },
  { playerId: 'p4', employeeNumber: '4281', firstName: 'Rasany',   lastName: 'Mekdarasack', email: 'rasany@example.com',  badgeNumber: '100064', password: 'pass4' },
  { playerId: 'p5', employeeNumber: '9951', firstName: 'Cory',     lastName: 'Loucks',      email: 'cory@example.com',    badgeNumber: '111355', password: 'pass5' },
];

export const INITIAL_ADMINS = [
  { id: 'a1', nameFirst: 'Manikanta', nameLast: 'Venkata', enumber: '1',    badgeNo: '112234', jobTitle: 'Business Analyst', department: 'Business',  email: 'mvenkata@example.com', adminLevel: 1, password: 'admin123' },
  { id: 'a2', nameFirst: 'Sai',       nameLast: 'Vanama',  enumber: '3',    badgeNo: '111113', jobTitle: 'Azure Developer',  department: 'IT',        email: 'svanama@example.com',  adminLevel: 2, password: 'admin123' },
  { id: 'a3', nameFirst: 'Dwight',    nameLast: 'Peltier', enumber: '4034', badgeNo: '100305', jobTitle: 'Info Security',    department: 'Accounting',email: 'dpeltier@example.com', adminLevel: 2, password: 'admin123' },
];
