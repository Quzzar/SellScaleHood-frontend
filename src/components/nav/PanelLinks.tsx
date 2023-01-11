import React, { useContext } from 'react';
import { IconInfoCircle, IconHistory, IconTrendingUp } from '@tabler/icons';
import { ThemeIcon, UnstyledButton, Group, Text, Accordion, Flex, MantineTheme } from '@mantine/core';
import { UserContext } from '../../contexts/user';
import { getHistory } from '../../utils/stockHistory';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

type PanelLinkProps = {
  icon: React.ReactNode;
  color: string;
  label: string;
  onClick: () => void,
  isActive: boolean,
}

function getHoverColor(theme: MantineTheme) {
  // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
  return (theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]) + '50';
}

function PanelLink({ icon, color, label, onClick, isActive }: PanelLinkProps) {

  return (
    <UnstyledButton
      my={4}
      sx={(theme) => ({
        display: 'block',
        width: '259px',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor: getHoverColor(theme),
        },
        backgroundColor: isActive ? getHoverColor(theme) : 'inherit',
      })}
      onClick={onClick}
    >
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}


export function PanelLinks() {

  const queryClient = useQueryClient();
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div>

      <PanelLink
        icon={<IconInfoCircle size={16} />}
        color={'violet'}
        label={`${t('panelAbout')}`}
        isActive={location.pathname?.toLowerCase().startsWith('/about') || location.pathname === '/' || location.pathname === ''}
        onClick={() => {
          navigate(`/`);
        }}
      />

      {userContext.user.localId && (
        <PanelLink
          icon={<IconTrendingUp size={16} />}
          color={'blue'}
          label={`${t('panelPortfolio')}`}
          isActive={location.pathname?.toLowerCase().startsWith('/portfolio')}
          onClick={() => {
            /* We remove the query from PortfolioPage before navigating to fix a caching bug
            * between react-query and react-router.
            */
            queryClient.removeQueries({ queryKey: ['get-portfolio'] });
            navigate(`/portfolio`);
          }}
        />
      )}

      <Accordion variant="filled" my={4}>
        <Accordion.Item value="recently-viewed"
          sx={(theme) => ({
            '&[data-active]': {
              backgroundColor: getHoverColor(theme),
            },
          })}
        >
          <Accordion.Control
            icon={<ThemeIcon color={'grape'} variant="light"><IconHistory size={16} /></ThemeIcon>}
            p={10}
            sx={(theme) => ({
              borderRadius: theme.radius.sm,

              '&:hover': {
                backgroundColor: getHoverColor(theme),
              },
            })}
          >
            <Text size="sm" ml={4}>{`${t('panelRecentlyViewed')}`}</Text>
          </Accordion.Control>
          <Accordion.Panel sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            {getHistory().reverse().map((h) => {
              return (
                <UnstyledButton
                  key={`recent-history-${h.ticker}`}
                  onClick={() => {
                    /* We remove the query from StockPage before navigating to fix a caching bug
                     * between react-query and react-router.
                     */
                    queryClient.removeQueries({ queryKey: ['get-stock-info'] });
                    navigate(`/ticker/${h.ticker}`);
                  }}
                  sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                    '&:hover': {
                      backgroundColor: getHoverColor(theme),
                    },
                  })}
                >
                  <Flex
                    gap="md"
                    justify="space-between"
                    wrap="nowrap"
                    align="center"
                  >
                    <Text
                      size="sm"
                      fw={700}
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >{h.ticker}</Text>
                    <Text
                      size="sm"
                      sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >{h.ticker !== h.name ? h.name : ''}</Text>
                  </Flex>
                </UnstyledButton>
              );
            })}
            {getHistory().length === 0 && (
              <Text ta="center" fs="italic" fz="sm" c="dimmed" pt={10}>{`${t('noRecentHistory')}`}</Text>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}