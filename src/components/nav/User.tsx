import React, { useContext } from 'react';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons';
import { UnstyledButton, Group, Avatar, Text, Box, useMantineTheme, Button, Title } from '@mantine/core';
import { UserContext } from '../../contexts/user';
import { SCREEN_SIZES } from '../../constants/data';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { openContextModal } from '@mantine/modals';
import DefaultProfile from '../../assets/images/profile.png';

export function User() {

  const { t } = useTranslation();
  const theme = useMantineTheme();
  const userContext = useContext(UserContext);

  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);

  // If user is NOT logged in,
  if (!userContext.user.localId) {
    return (
      <>
        {mdScreenOrLess && (
          <Box
            sx={{
              paddingTop: theme.spacing.sm,
              borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
                }`,
            }}
          >
            <Group position="center">
              <Button variant="subtle" color="gray"
                sx={{ color: (theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[8]) }}
                onClick={() =>
                  openContextModal({
                    modal: 'login',
                    title: (<Title order={3}>{`${t('loginToAccount')}`}</Title>),
                    innerProps: {
                      form: 'login',
                    },
                  })
                }
              >
                {t('login')}
              </Button>
              <Button variant="default" color="gray"
                onClick={() =>
                  openContextModal({
                    modal: 'login',
                    title: (<Title order={3}>{`${t('registerAccount')}`}</Title>),
                    innerProps: {
                      form: 'register',
                    },
                  })
                }
              >
                {t('signUp')}
              </Button>
            </Group>
          </Box>
        )}
      </>
    );
  }

  // If user is logged in,
  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
        borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
          }`,
      }}
    >
      <UnstyledButton
        onClick={() =>
          openContextModal({
            modal: 'account',
            title: (<Title order={3}>{`${t('account')}`}</Title>),
            innerProps: {},
          })
        }
        sx={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

          '&:hover': {
            // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
            backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]) + '50',
          },
        }}
      >
        <Group>
          <Avatar
            src={DefaultProfile}
            radius="xl"
          />
          <Box sx={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {userContext.user.displayName ? userContext.user.displayName : t('newUser')}
            </Text>
            <Text color="dimmed" size="xs">
              {userContext.user.email}
            </Text>
          </Box>

          {theme.dir === 'ltr' ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </Group>
      </UnstyledButton>
    </Box>
  );
}