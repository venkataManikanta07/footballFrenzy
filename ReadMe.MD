# Football Frenzy POC

This repository uses Next.js with Material UI as the foundation for the proof-of-concept. The original Create React App content has been removed.

## Getting started

1. Add a background image named `nfl.jpg` inside the `public` directory. The login page references `/nfl.jpg`.
2. Install dependencies (use legacy peer deps to avoid conflicts):
   ```powershell
   npm install --legacy-peer-deps
   ```
3. Launch the development server:
   ```powershell
   npm run dev
   ```

The app will be available at `http://localhost:3000` (or `3001` if `3000` is occupied).

## Current state

- A login screen is displayed at the root route.
- Material UI styles are applied with a light theme.
- Authentication is handled by a simple mock (`mock/users.js`).

### Mock credentials

| Role   | Employee # | Password   |
|--------|------------|------------|
| Player | 1001       | password   |
| Player | 1002       | password   |
| Admin  | 9999       | admin123   |

(Feel free to update `mock/users.js` with more entries.)

Business logic and additional pages will be added incrementally.
