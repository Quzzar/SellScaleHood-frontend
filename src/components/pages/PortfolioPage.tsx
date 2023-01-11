import { Group, Container, Divider, useMantineTheme, Box, Stack, Text } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import sortBy from 'lodash/sortBy';
import { PORTFOLIO_PAGE_SIZE } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import StockTransaction from "../common/StockTransaction";
import { sign } from "../../utils/general";
import customLoader from "../../utils/customLoader";

export type StockPurchase = {
  id?: string,
  readonly ticker: string,
  readonly price: number,
  readonly qty: number,
  readonly totalValue?: number,
  readonly totalReturn?: { amt: number, percent: number },
  readonly todayReturn?: { amt: number, percent: number },
};

export default function PortfolioPage() {

  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'ticker', direction: 'asc' });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching } = useQuery({
    queryKey: ['get-portfolio', { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { return; }

      // TODO: The page query parameter currently does nothing, make the backend handle pagination
      // Make request to backend to get stock info (see: api/portfolio.py)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/portfolio?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const res = await response.json();

      switch (res.message) {
        case 'INVALID_ID_TOKEN':
          /* If we have an invalid access token, it probably means the system in place
           * in App.tsx is currently occuring and we're about to update our tokens.
           * If that's the case, we should wait for the tokens to be updated and reattempt
           * this query.
           * TODO: For now, let's just wait and reload because that's an easy solution but
           * in the future a better solution would be to just recall this query when ready.
           */
          setTimeout(() => {
            window.location.reload();
          }, 5000);
          return;
        case '':

          if(!res.data){
            return [];
          }

          let entries = new Map();
          for (let purchase of (Object.values(res.data) as StockPurchase[])) {
            const value = entries.get(purchase.ticker);
            if (value) {
              // Increment qty and take average of price
              entries.set(purchase.ticker, { price: (value.price + purchase.price) / 2, qty: value.qty + purchase.qty })
            } else {
              entries.set(purchase.ticker, { price: purchase.price, qty: purchase.qty });
            }
          }
          // Take entries map and convert back to StockPurchase[]
          const result = [...entries.entries()].map(([key, value]) => {
            return {
              id: key,
              ticker: key,
              price: value.price,
              qty: value.qty,
              totalValue: value.price * value.qty,
              // TODO: Add today's return and total return (fetched from API?)
              todayReturn: { amt: 0, percent: 0 },
              totalReturn: { amt: 0, percent: 0 },
            };
          });
          totalRecords.current = result.length;

          // Sort result by current sortStatus
          let sortedResult = sortBy(result, sortStatus.columnAccessor);
          sortedResult = (sortStatus.direction === 'desc') ? sortedResult.reverse() : sortedResult;

          // Only display the results that could be on this page - TODO: Again, this should be done by the API
          const s_i = (page - 1) * PORTFOLIO_PAGE_SIZE;
          const e_i = (page - 1) * PORTFOLIO_PAGE_SIZE + PORTFOLIO_PAGE_SIZE;
          return sortedResult.slice(s_i, e_i);

        default:
          console.error(res);
          return undefined;
      }
    },
    refetchOnWindowFocus: false,
  });

  const {
    breakpoints: { xs: xsBreakpoint, sm: smBreakpoint, md: mdBreakpoint },
  } = useMantineTheme();
  const aboveXsMediaQuery = `(min-width: ${xsBreakpoint}px)`;
  const aboveSmMediaQuery = `(min-width: ${smBreakpoint}px)`;
  const aboveMdMediaQuery = `(min-width: ${mdBreakpoint}px)`;

  return (
    // place the data table in a height-restricted container to make it vertically-scrollable
    <PageFrame>
      <Box sx={{ height: 'clamp(420px, 70vh, 1000px)', }}>
        <DataTable
          verticalAlignment='top'
          noRecordsText={`${t('stockNoneOwned')}`}
          fetching={isFetching}
          customLoader={customLoader}
          columns={[
            {
              accessor: 'ticker',
              title: 'Symbol',
              //width: 100,
              ellipsis: true,
              sortable: true,
              render: ({ ticker }) => (
                <Text fw={600}>
                  {ticker}
                </Text>
              ),
            },
            {
              accessor: 'qty',
              title: 'Shares',
              //width: 100,
              ellipsis: true,
              sortable: true,
            },
            {
              accessor: 'totalValue',
              title: 'Value',
              //width: 150,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveMdMediaQuery,
              // TODO: Make it the currency type instead of the $
              render: ({ totalValue }) => `$ ${totalValue.toFixed(2)}`,
            },
            {
              accessor: 'todayReturn',
              title: `Today's Return`,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveMdMediaQuery,
              // TODO: Make it the currency type instead of the $
              render: ({ todayReturn }) => (
                <Text color={todayReturn.amt >= 0 ? 'green' : 'red'}>
                  $ {todayReturn.amt.toFixed(2)} ({sign(+todayReturn.percent.toFixed(2))}%)
                </Text>
              ),
            },
            {
              accessor: 'totalReturn',
              title: `Return`,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveXsMediaQuery,
              // TODO: Make it the currency type instead of the $
              render: ({ totalReturn }) => (
                <Text color={totalReturn.amt >= 0 ? 'green' : 'red'}>
                  $ {totalReturn.amt.toFixed(2)} ({sign(+totalReturn.percent.toFixed(2))}%)
                </Text>
              ),
            },
            {
              accessor: 'price',
              title: 'Price/Share',
              //width: 150,
              ellipsis: true,
              sortable: true,
              // TODO: Make it the currency type instead of the $
              render: ({ price }) => `$ ${price?.toFixed(2)}`,
            },
          ]}
          records={data}
          rowExpansion={{
            content: ({ record }) => (
              <Stack p="xs" spacing={6} sx={(theme) => ({
                backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]),
              })}>
                <Group>
                  {/* Temporary chart, TODO: Replace this image with a real chart (probably from chart.js) */}
                  <Container py='50px'>
                    A chart goes here
                  </Container>
                </Group>
                <Divider label={`${t('sell')}`} size="sm" labelPosition="center" />
                <Group position="center">
                  {/* TODO: Make it the currency type instead of the $ */}
                  <StockTransaction ticker={record.ticker} cur={'$'} price={0.0} buying={false} max={record.qty} />
                </Group>
              </Stack>
            ),
            collapseProps: {
              animateOpacity: false,
            },
          }}
          page={page}
          onPageChange={setPage}
          totalRecords={totalRecords.current}
          recordsPerPage={PORTFOLIO_PAGE_SIZE}
          paginationColor={'cyan'}
          sortStatus={sortStatus}
          onSortStatusChange={handleSortStatusChange}
          sx={(theme) => ({
            borderRadius: '8px',
            thead: {
              backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]),
            },
            tr: {
              // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
              backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]) + '60',
              margin: '20px 0',
            },
            
          })}
        />
      </Box>
    </PageFrame>
  );
}