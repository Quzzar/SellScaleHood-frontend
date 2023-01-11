import { useContext, useState } from 'react';
import { IconSun, IconMoonStars } from '@tabler/icons';
import { AppShell, Navbar, Header, Group, ActionIcon, useMantineColorScheme, MediaQuery, Burger, useMantineTheme, Button, Title } from '@mantine/core';
import { PanelLinks } from './nav/PanelLinks';
import { User } from './nav/User';
import { Logo } from './nav/Logo';
import { useMediaQuery } from '@mantine/hooks';
import { SCREEN_SIZES } from '../constants/data';
import backgroundImg from '../assets/images/background.svg';
import { SearchBar } from './nav/SearchBar';
import { useTranslation } from 'react-i18next';
import { openContextModal } from '@mantine/modals';
import { UserContext } from '../contexts/user';

export default function Layout({ children }: { children: React.ReactNode }) {

  const { t } = useTranslation();
  const theme = useMantineTheme();
  const userContext = useContext(UserContext);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);

  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      padding="md"
      fixed={false}

      navbar={
        <Navbar
          width={{ base: 280 }}
          p="xs"
          hiddenBreakpoint="sm"
          hidden={!opened}
          sx={{
            position: (smScreenOrLess) ? 'absolute' : 'static',
            
            backdropFilter: 'blur(8px)',
            // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
            backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]) + '75',
          }}
        >
          <Navbar.Section grow>
            {/* Show search bar if larger than tablet */}
            {smScreenOrLess && <SearchBar isSmall={true} />}
            <PanelLinks />
          </Navbar.Section>
          <Navbar.Section>
            <User />
          </Navbar.Section>
        </Navbar>
      }

      header={
        <Header height={60}>
          <Group sx={{ height: '100%', flexWrap: 'nowrap' }} px={20} position="apart">
            {/* Show burger menu if tablet or smaller */}
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
              />
            </MediaQuery>

            <Logo colorScheme={colorScheme} />

            {/* Show search bar if larger than tablet */}
            {!smScreenOrLess && <SearchBar />}


            <Group>
              {/* Show login buttons if desktop or larger and not logged in */}
              {!mdScreenOrLess && !userContext.user.localId && (
                <>
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
                </>
              )}

              {/* Dark mode / light mode switch */}
              <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30} sx={{ borderRadius: '50px' }}>
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
              </ActionIcon>
            </Group>

          </Group>
        </Header>
      }

      styles={(theme) => ({
        main: {
          height: 'calc(100vh - 60px)',
        },
        body: {
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          overflowY: 'auto',
        }
      })}
    >
      <main>{children}</main>
    </AppShell>
  );
}