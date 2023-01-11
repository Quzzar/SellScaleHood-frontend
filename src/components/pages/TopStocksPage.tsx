import { useMantineTheme, Box, Title, Text } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import sortBy from 'lodash/sortBy';
import { PORTFOLIO_PAGE_SIZE } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import { sign } from "../../utils/general";
import customLoader from "../../utils/customLoader";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Stock } from "../App";

// Makeshift memoization, TODO: replace this with a better system
let _topStockList: Stock[] | undefined = undefined;
async function getStockList(continueFn: () => Promise<Stock[] | undefined>) {
  if (!_topStockList) {
    _topStockList = await continueFn();
  }
  return _topStockList;
}
export function clearStockList() {
  _topStockList = undefined;
}

/* The queryParam prop is an optional string that will make add it's string value as a query parameter
 * to the API endpoint that is being called. The value for the query parameter is the next domain path.
 * Ex. "/top/26" with endpoint="top" and queryParam="count" -> "/api/top?count=26"
 */
export default function TopStocksPage({ title, endpoint, queryParam }: { title: string, endpoint: string, queryParam?: string }) {

  const loader: any = useLoaderData();
  const queryParamValue = (queryParam) ? loader[queryParam] : null;

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching } = useQuery({
    queryKey: ['get-top-stocks', { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      let fetchTopStocks = async () => {
        // TODO: The page query parameter currently does nothing, make the backend handle pagination
        // Make request to backend to get endpoint info (see: api/yahoo/)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/${endpoint}${(queryParam) ? `?${queryParam}=${queryParamValue}` : ``}`, {
          method: 'GET',
        });
        const res = await response.json();

        switch (res.message) {
          case '':
            const result = res.data as Stock[];
            totalRecords.current = result.length;

            // Add rank
            let rank = 1;
            return result.map((s) => {
              s.id = rank;
              rank++;
              return s;
            });
          default:
            console.error(res);
            return undefined;
        }
      }

      // Fetch stock list (either from cache or API)
      let result = await getStockList(fetchTopStocks);

      // Sort result by current sortStatus
      let sortedResult = sortBy(result, sortStatus.columnAccessor);
      sortedResult = (sortStatus.direction === 'desc') ? sortedResult.reverse() : sortedResult;

      // Only display the results that could be on this page
      const s_i = (page - 1) * PORTFOLIO_PAGE_SIZE;
      const e_i = (page - 1) * PORTFOLIO_PAGE_SIZE + PORTFOLIO_PAGE_SIZE;
      return sortedResult.slice(s_i, e_i);
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
      <Title order={2} align="center">{title}</Title>
      <Box sx={{ height: 'clamp(420px, 70vh, 1000px)', }}>
        <DataTable
          verticalAlignment="top"
          fetching={isFetching}
          customLoader={customLoader}
          columns={[
            {
              accessor: 'id',
              title: 'Rank',
              sortable: true,
            },
            {
              accessor: 'ticker',
              title: 'Symbol',
              ellipsis: true,
              sortable: true,
              render: ({ ticker }) => (
                <Text fw={600}>
                  {ticker}
                </Text>
              ),
            },
            {
              accessor: 'price',
              title: 'Value',
              ellipsis: true,
              sortable: true,
              // TODO: Make it the currency type instead of the $
              render: ({ price }) => `$ ${price?.toFixed(2)}`,
            },
            {
              accessor: `dayPercent`,
              title: `Today's Change`,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveXsMediaQuery,
              // TODO: Make it the currency type instead of the $
              render: ({ dayPercent, dayChange }) => (
                <Text color={dayPercent && dayPercent >= 0 ? 'green' : 'red'}>
                  {sign(+(dayPercent ? dayPercent : 0).toFixed(2))}% ($ {+(dayChange ? dayChange : 0).toFixed(2)})
                </Text>
              ),
            },
            {
              accessor: 'name',
              title: `Name`,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveMdMediaQuery,
            },
            {
              accessor: 'sector',
              title: `Sector`,
              ellipsis: true,
              sortable: true,
              visibleMediaQuery: aboveMdMediaQuery,
            },
          ]}
          records={data}
          page={page}
          onPageChange={setPage}
          onRowClick={(stock, rowIndex) => {
            /* We remove the query from StockPage before navigating to fix a caching bug
             * between react-query and react-router.
             */
            queryClient.removeQueries({ queryKey: ['get-stock-info'] });
            navigate(`/ticker/${stock.ticker}`);
          }}
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