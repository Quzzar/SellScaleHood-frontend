import { List, ThemeIcon, Text, Container, Stack, Flex, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconBrowserPlus, IconCircleCheck, IconBrandLaravel, IconSeo, IconBoxMultiple3, IconDevices, IconInfoSquareRounded, IconLanguage, IconMoonStars } from "@tabler/icons";
import { useTranslation } from "react-i18next";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";


export default function AboutPage() {

  const theme = useMantineTheme();
  const { t } = useTranslation();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return ( // TODO: Some specific pixel constants are being used here for sidebar width, these should be moved into constants/data.ts
    <Container sx={{ width: `clamp(260px, ${smScreenOrLess ? '80vw' : 'calc(100vw - 280px)'}, 1000px)`, }} p={0}>
      <PageFrame>
        <Stack p={10}>
          <Flex
            wrap="nowrap"
          >
            <Text>
              <ThemeIcon color="blue" variant="filled" size="xl" radius="xl">
                <IconInfoSquareRounded />
              </ThemeIcon>
            </Text>
            <Title order={2} pl={10} >{`${t('aboutWelcome')}`}</Title>
          </Flex>
          <Text>
            {`${t('aboutWelcomeDesc1')}`}
          </Text>
          <Text>
          {`${t('aboutWelcomeDesc2')}`}
          </Text>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <IconCircleCheck size={16} />
              </ThemeIcon>
            }
          >
            <List.Item
              icon={
                <ThemeIcon color="violet" size={24} radius="xl">
                  <IconBrandLaravel size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutFlexibleTitle')}`}:</b> {`${t('aboutFlexibleDesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="pink" size={24} radius="xl">
                  <IconLanguage size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutInternationalTitle')}`}:</b> {`${t('aboutInternationalDesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color={theme.colorScheme === 'dark' ? 'gray' : 'dark'} variant={theme.colorScheme === 'dark' ? 'outline' : 'filled'} size={24} radius="xl">
                  <IconMoonStars size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutSiteThemeTitle')}`}:</b> {`${t('aboutSiteThemeDesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="indigo" size={24} radius="xl">
                  <IconBrowserPlus size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutPWATitle')}`}:</b> {`${t('aboutPWADesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconDevices size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutResponsiveDesignTitle')}`}:</b> {`${t('aboutResponsiveDesignDesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="orange" size={24} radius="xl">
                  <IconBoxMultiple3 size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutScalableTitle')}`}:</b> {`${t('aboutScalableDesc')}`}</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconSeo size={16} />
                </ThemeIcon>
              }
              sx={{ lineHeight: '1.3em' }}
            ><b>{`${t('aboutSEOTitle')}`}:</b> {`${t('aboutSEODesc')}`}</List.Item>
          </List>
        </Stack>
      </PageFrame>
    </Container>
  );

}
