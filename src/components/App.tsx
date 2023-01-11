import { useEffect, useState } from 'react';

import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  LoadingOverlay,
} from '@mantine/core';

import Layout from './Layout';
import { SpotlightProvider } from '@mantine/spotlight';
import { IconFileText, IconSearch, IconTrendingDown, IconTrendingUp } from '@tabler/icons';
import { useTranslation } from 'react-i18next';
import { User, UserContext } from '../contexts/user';
import { Outlet, useNavigate } from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import LoginModal from './modals/LoginModal';
import { useQuery, useQueryClient } from 'react-query';
import updateTokens from '../utils/updateTokens';
import VerifyEmailModal from './modals/VerifyEmailModal';
import AccountModal from './modals/AccountModal';
import { useDebouncedState } from '@mantine/hooks';
import customLoader from '../utils/customLoader';
import { NotificationsProvider } from '@mantine/notifications';
import { clearStockList } from './pages/TopStocksPage';

export type Stock = {
  id?: number,
  readonly ticker: string,
  readonly name: string,
  readonly trend?: string,
  readonly sector?: string,
  readonly summary?: string,
  readonly price?: number,
  readonly dayChange?: number,
  readonly dayPercent?: number,
};

export default function App() {

  // Site light or dark mode
  const isSystemDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem('site-theme');
  const currentColorScheme: ColorScheme = (savedSiteTheme != null) ?
    ((savedSiteTheme === 'dark') ? 'dark' : 'light') :
    ((isSystemDarkMode) ? 'dark' : 'light');

  const [colorScheme, setColorScheme] = useState<ColorScheme>(currentColorScheme);
  const toggleColorScheme = (value?: ColorScheme) => {
    let nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    localStorage.setItem('site-theme', nextColorScheme);
  };

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    localId: '',
    email: '',
    displayName: '',
  });


  const mainActions = [
    {
      title: `${t('searchTrendingStocks')}`,
      description: `${t('searchDescTrendingStocks')}`,
      group: 'main',
      onTrigger: () => {
        /* We remove the query from TopStocksPage before navigating to fix a caching bug
         * between react-query and react-router.
         */
        queryClient.removeQueries({ queryKey: ['get-top-stocks'] });
        clearStockList(); // Clear makeshift memoization in TopStocksPage
        navigate(`/trending/20`);
      },
      icon: <IconFileText size={18} />,
    },
    {
      title: `${t('searchTop10Stocks')}`,
      description: `${t('searchDescTop10Stocks')}`,
      group: 'main',
      onTrigger: () => {
        /* We remove the query from TopStocksPage before navigating to fix a caching bug
         * between react-query and react-router.
         */
        queryClient.removeQueries({ queryKey: ['get-top-stocks'] });
        clearStockList(); // Clear makeshift memoization in TopStocksPage
        navigate(`/top/10`);
      },
      icon: <IconFileText size={18} />,
    },
    {
      title: `${t('searchMostWatchedStocks')}`,
      description: `${t('searchDescMostWatchedStocks')}`,
      group: 'main',
      onTrigger: () => {
        /* We remove the query from TopStocksPage before navigating to fix a caching bug
         * between react-query and react-router.
         */
        queryClient.removeQueries({ queryKey: ['get-top-stocks'] });
        clearStockList(); // Clear makeshift memoization in TopStocksPage
        navigate(`/most-watched/20`);
      },
      icon: <IconFileText size={18} />,
    },
  ];

  // When page is loading, fetch user info from accessToken
  const infoResult = useQuery({
    queryKey: ['get-info'],
    queryFn: async () => {
      if (user.localId) { return ''; }

      const getInfo = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) { return; }

        console.log('Retrieving profile info...');

        // Make request to backend to get info (see: api/auth/info.py)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/info`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const res = await response.json();

        switch (res.message) {
          case 'INVALID_ID_TOKEN':
            console.log('Invalid access token.')
            let success = await updateTokens();
            if (success) {
              console.log('Updated access token, attempting info retrieval again...')
              await getInfo();
            }
            return;
          case '':
            console.log('Successfully found info.')
            setUser({
              localId: res.data.localId,
              email: res.data.email,
              displayName: res.data.displayName,
            });
            return;
          default:
            return;
        }
      }

      await getInfo();
      return '';

    }
  });

  // Ticker Querying //
  const [query, setQuery] = useDebouncedState('', 400);
  // For queryResult, null = loading and false = failed to find.
  const [queryResult, setQueryResult] = useState<Stock | null | false>(null);

  useEffect(() => {

    if (query === '') {
      setQueryResult(false);
      return;
    }

    setQueryResult(null);
    async function makeQuery() {
      // Make request to backend to get stock info (see: api/yahoo/query.py)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/query?ticker=${query}`, {
        method: 'GET',
      });
      const res = await response.json();

      switch (res.message) {
        case 'STOCK_NOT_FOUND':
          setQueryResult(false);
          return;
        case '':
          setQueryResult({
            ticker: res.data.ticker,
            name: (res.data.name === res.data.ticker) ? res.data.sector : res.data.name,
            trend: res.data.trend,
            sector: res.data.sector,
            summary: res.data.summary,
          });
          return;
        default:
          console.error(res);
          return;
      }
    }
    makeQuery();
  }, [query]);

  return (

    <UserContext.Provider value={{ user, setUser: (u: User) => { setUser(u) } }}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <SpotlightProvider
            actions={(query: string) => {
              /* Whenever input changes, this function is called and query is set via setQuery
               * setQuery is a debouncer, after the set debounce time the above useEffect callback is executed.
               * That callback fetches the stock data and updates queryResult accordingly.
               */
              setQuery(query.trim());
              if (queryResult && queryResult.ticker.toLowerCase().trim() === query.toLowerCase().trim()) {
                return [{
                  title: queryResult.ticker,
                  description: queryResult.name,
                  group: 'search',
                  onTrigger: () => {
                    /* We remove the query from StockPage before navigating to fix a caching bug
                     * between react-query and react-router.
                     */
                    queryClient.removeQueries({ queryKey: ['get-stock-info'] });
                    navigate(`/ticker/${queryResult.ticker}`);
                  },
                  icon: queryResult.trend === 'down' ? <IconTrendingDown size={18} /> : <IconTrendingUp size={18} />,
                }, ...mainActions];
              } else {
                return mainActions;
              }
            }}
            searchIcon={<IconSearch size={18} />}
            searchPlaceholder={t('searchPlaceholder') + ''}
            searchInputProps={{ autoComplete: 'off' }}
            shortcut={['mod + K', 'mod + P', '/']}
            highlightQuery
            nothingFoundMessage={queryResult === false && query !== '' ? `${t('nothingFound')}` : `${t('loading')}`}
          >
            <ModalsProvider modals={{
              login: LoginModal,
              verifyEmail: VerifyEmailModal,
              account: AccountModal,
            }}>
              <NotificationsProvider>
                <LoadingOverlay visible={infoResult.isLoading} loader={customLoader} overlayBlur={4} />
                <Layout>
                  {/* Outlet is where react-router will render child routes */}
                  <Outlet />
                </Layout>
              </NotificationsProvider>
            </ModalsProvider>
          </SpotlightProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserContext.Provider>

  );
}
