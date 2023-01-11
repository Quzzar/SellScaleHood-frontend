import { Group, Text, UnstyledButton } from '@mantine/core';
import { openSpotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { useTranslation } from 'react-i18next';
import useStyles from './SearchBars.styles';

export function SearchBar({ isSmall }: { isSmall?: boolean }) {

  const { t } = useTranslation();
  const { classes } = useStyles();

  return (
    <UnstyledButton
      onClick={() => openSpotlight()}
      className={classes.root}
      sx={{ width: (isSmall) ? '100%' : 400 }}
    >
      <Group spacing="xs" sx={{ flexWrap: 'nowrap' }}>
        <IconSearch size={14} stroke={1.5} />
        <Text size="sm" color="dimmed" pr={(isSmall) ? 0 : 148}>
          {t('searchPlaceholder')}
        </Text>
        {!isSmall && (
          <Text weight={700} className={classes.shortcut}>
            {t('quickOpenSearch')}
        </Text>
        )}
      </Group>
    </UnstyledButton>
  );

}