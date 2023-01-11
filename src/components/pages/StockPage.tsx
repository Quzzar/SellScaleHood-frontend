import { Flex, Group, LoadingOverlay, Title, Text, Table, Container, Divider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useLoaderData, } from "react-router-dom";
import getSymbol from "../../constants/currencyMap";
import { SCREEN_SIZES } from "../../constants/data";
import { UserContext } from "../../contexts/user";
import customLoader from "../../utils/customLoader";
import { sign } from "../../utils/general";
import { addToHistory } from "../../utils/stockHistory";
import PageFrame from "../common/PageFrame";
import StockTransaction from "../common/StockTransaction";

export default function StockPage() {

  const { id } = useLoaderData() as { id: string };
  const { t } = useTranslation();
  const userContext = useContext(UserContext);
  const xsScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.XS})`);

  // When page is loading, fetch user info from accessToken
  const { isLoading, data } = useQuery({
    queryKey: ['get-stock-info', { ticker: id }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { ticker }] = queryKey;

      // Make request to backend to get stock info (see: api/yahoo/query.py)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/query?ticker=${ticker}&details=true`, {
        method: 'GET',
      });
      const res = await response.json();

      switch (res.message) {
        case 'STOCK_NOT_FOUND':
          return null;
        case '':
          return res.data;
        default:
          console.error(res);
          return null;
      }
    },
  });

  // If data is undefined, we're still fetching data
  // TODO: Make the loader not fullscreen like the loader for the portfolio page
  if (data === undefined || isLoading) {
    return (
      <>
        <LoadingOverlay visible={isLoading} loader={customLoader} overlayBlur={4} />
        <PageFrame>
          <Title order={3}>Loading...</Title>
        </PageFrame>
      </>
    );
  }

  // If data is null (or missing data), stock isn't found
  if (data === null || !data.open) {
    return (
      <>
        <PageFrame>
          <Title order={3}>Unknown ticker: {id}</Title>
        </PageFrame>
      </>
    );
  }

  // Stock values
  let cur = getSymbol(data.currency);
  let name = data.shortName ? data.shortName : (data.longName ? data.longName : data.symbol);
  let symbol = data.symbol;
  let currentPrice = data.currentPrice?.toFixed(2);

  // Details table
  let previousClose = data.previousClose;
  let marketCap = data.marketCap?.toLocaleString(`${t('localeCode')}`);
  let open = data.open;
  let daysRange = `${data.dayLow?.toFixed(2)} - ${data.dayHigh?.toFixed(2)}`;
  let bid = data.bid;
  let ftWeekRange = `${data.fiftyTwoWeekLow?.toFixed(2)} - ${data.fiftyTwoWeekHigh?.toFixed(2)}`;
  let ask = data.ask;
  let volume = data.volume?.toLocaleString(`${t('localeCode')}`);
  let oneYearTargetEst = data.targetMeanPrice;
  let avgVolume = data.averageVolume?.toLocaleString(`${t('localeCode')}`);

  let bidSize = data.bidSize;
  let askSize = data.askSize;

  // Calculated values
  let dayChange = data.currentPrice - data.previousClose;
  let dayPercent = (100 / data.currentPrice) * dayChange;

  // Add to recent stock history. TODO: Currently adds to history on each render, maybe only on first useQuery load?
  addToHistory({ ticker: symbol, name: name });

  return (
    <>
      <PageFrame>
        <Group>
          <Title order={3}>{name} {(name !== symbol) ? `(${symbol})` : ``}</Title>
        </Group>
        <Group>
          <Flex
            gap="xs"
            wrap="nowrap"
          >
            <Text fz={'2rem'} style={{ whiteSpace: 'nowrap' }} fw={700}>{cur + currentPrice}</Text>
            <Text fz="xl" color={dayChange > 0 ? 'green' : 'red'}>{sign(+dayChange.toFixed(2))}</Text>
            <Text fz="xl" color={dayPercent > 0 ? 'green' : 'red'}>({sign(+dayPercent.toFixed(2))}%)</Text>
          </Flex>
        </Group>
        <Group>
          {/* Temporary chart, TODO: Replace this image with a real chart (probably from chart.js) */}
          <Container py='50px'>
            A chart goes here
          </Container>
        </Group>
        <Group>
          <Table >
            <tbody>
              {xsScreenOrLess && (
                <>
                  <tr>
                    <td><b>{`${t('stockPreviousClose')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + previousClose}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockOpen')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + open}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockBid')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + bid} × {bidSize}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockAsk')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + ask} × {askSize}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockOneYearTargetEst')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + oneYearTargetEst}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockMarketCap')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + marketCap}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockDaysRange')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + '' + daysRange}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stock52WeekRange')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + '' + ftWeekRange}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockVolume')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{volume}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockAvgVolume')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{avgVolume}</td>
                  </tr>
                </>
              )}
              {!xsScreenOrLess && (
                <>
                  <tr>
                    <td><b>{`${t('stockPreviousClose')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + previousClose}</td>
                    <td><b>{`${t('stockMarketCap')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + marketCap}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockOpen')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + open}</td>
                    <td><b>{`${t('stockDaysRange')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + '' + daysRange}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockBid')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + bid} × {bidSize}</td>
                    <td><b>{`${t('stock52WeekRange')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + '' + ftWeekRange}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockAsk')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + ask} × {askSize}</td>
                    <td><b>{`${t('stockVolume')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{volume}</td>
                  </tr>
                  <tr>
                    <td><b>{`${t('stockOneYearTargetEst')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cur + oneYearTargetEst}</td>
                    <td><b>{`${t('stockAvgVolume')}`}</b></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{avgVolume}</td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
        </Group>
        {/* Only display if user is logged in */}
        {userContext.user.localId && (
          <>
            <Divider label={`${t('purchase')}`} size="sm" labelPosition="center" />
            <Group position="center">
              <StockTransaction ticker={symbol} cur={cur} price={currentPrice} buying={true} />
            </Group>
          </>
        )}
      </PageFrame>
    </>
  );
}