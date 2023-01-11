import { Anchor, Button, Group, Text, Paper, useMantineTheme, Avatar, Stack } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../contexts/user";
import DefaultProfile from '../../assets/images/profile.png';
import { useNavigate } from "react-router-dom";

export default function VerifyEmailModal({ context, id, innerProps }: ContextModalProps) {

  const { t } = useTranslation();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  const handleSignOut = () => {

    userContext.setUser({
      localId: '',
      email: '',
      displayName: '',
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    navigate('/');

    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Group>
        <Avatar src={DefaultProfile} radius="xl" />
        <Stack spacing={5}>
          <Text size="sm" weight={700} sx={{ lineHeight: 1 }}>
            {userContext.user.displayName ? userContext.user.displayName : t('newUser')}
          </Text>
          <Anchor
            color="dimmed"
            size="xs"
            sx={{ lineHeight: 1 }}
          >
            {userContext.user.email}
          </Anchor>
        </Stack>
      </Group>

      {/* TODO: Finish fleshing this modal out / adding features to it */}
      <Text size="sm" mt="md">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

      <Group mt="md" spacing="xl">
        <Text size="sm">
          <b>0</b> Following
        </Text>
        <Text size="sm">
          <b>1,174</b> Followers
        </Text>
      </Group>

      <Button variant="light" color="red" fullWidth mt="md" radius="md" onClick={handleSignOut}>
        {`${t('signOut')}`}
      </Button>
    </Paper>
  );
}
