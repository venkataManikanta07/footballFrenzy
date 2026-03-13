import * as React from 'react';
import Head from 'next/head';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  loadLS, saveLS,
  LS_ADMINS, LS_PLAYERS, LS_SEASONS, LS_WEEKS, LS_GAMES, LS_TEAMS, LS_PICKS,
  INITIAL_ADMINS, INITIAL_PLAYERS, INITIAL_SEASONS, INITIAL_WEEKS,
  INITIAL_GAMES, INITIAL_TEAMS, INITIAL_PICKS,
} from '../mock/store';

// Bump this string to force-reset all localStorage seed data on next page load.
const DATA_VERSION = 'v3';

// simple light theme for demonstration
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    // Remove the server-side injected CSS if any
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    // Force re-seed all data when DATA_VERSION changes
    const storedVersion = loadLS('ff_data_version', null);
    if (storedVersion !== DATA_VERSION) {
      saveLS(LS_SEASONS, INITIAL_SEASONS);
      saveLS(LS_WEEKS,   INITIAL_WEEKS);
      saveLS(LS_GAMES,   INITIAL_GAMES);
      saveLS(LS_TEAMS,   INITIAL_TEAMS);
      saveLS(LS_PICKS,   INITIAL_PICKS);
      saveLS(LS_ADMINS,  INITIAL_ADMINS);
      saveLS(LS_PLAYERS, INITIAL_PLAYERS);
      saveLS('ff_data_version', DATA_VERSION);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Football Frenzy POC</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
}
