import { ColorScheme, Flex, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FaFeatherAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GRADIENT_COLORS, SCREEN_SIZES } from '../../constants/data';

export function Logo({ colorScheme }: { colorScheme: ColorScheme }) {

  const phoneScreen = useMediaQuery(`(max-width: ${SCREEN_SIZES.TY})`);

  const fontSize = (phoneScreen) ? '1.2em' : '1.5em';
  const iconSize = (phoneScreen) ? 23 : 27;

  return (
    <Flex
      wrap="nowrap"
      onClick={() => {
        window.location.href = '/';
      }}
      sx={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Text weight={700} sx={{
        fontFamily: 'Raleway',
        fontSize,
        whiteSpace: 'nowrap',
        color: GRADIENT_COLORS[0],
      }}>SellScaleHood</Text>
      <Text pl='5px'>
        <FaFeatherAlt size={iconSize} color={GRADIENT_COLORS[0]} />
      </Text>
    </Flex>
  );
}