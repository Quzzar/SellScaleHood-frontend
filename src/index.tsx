import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './utils/i18n';
import App from './components/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './components/pages/ErrorPage';
import StockPage from './components/pages/StockPage';
import PortfolioPage from './components/pages/PortfolioPage';
import TopStocksPage from './components/pages/TopStocksPage';
import AboutPage from './components/pages/AboutPage';
import { t } from 'i18next';

const queryClient = new QueryClient();

// The DOM router for determining what pages are rendered at which paths
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <AboutPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'portfolio',
        element: <PortfolioPage />,
      },
      {
        path: 'ticker/:tickerId',
        element: <StockPage />,
        loader: async ({ params }) => { return { id: params.tickerId }; },
      },
      {
        path: 'trending/:count',
        element: <TopStocksPage title={`${t('trendingStocks')}`} endpoint='trending' queryParam='count' />,
        loader: async ({ params }) => { return { count: params.count }; },
      },
      {
        path: 'top/:count',
        element: <TopStocksPage title={`${t('top10Stocks')}`} endpoint='top' queryParam='count' />,
        loader: async ({ params }) => { return { count: params.count }; },
      },
      {
        path: 'most-watched/:count',
        element: <TopStocksPage title={`${t('mostWatchedStocks')}`} endpoint='most-watched' queryParam='count' />,
        loader: async ({ params }) => { return { count: params.count }; },
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
