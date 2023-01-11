import { Button, Text, Paper, useMantineTheme } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useTranslation } from "react-i18next";

export default function VerifyEmailModal({ context, id, innerProps }: ContextModalProps) {

  const { t } = useTranslation();
  const theme = useMantineTheme();

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Text size="sm" color="dimmed">
        {`${t('registerVerifyEmailDesc')}`}
      </Text>
      {/* TODO: We should have a way to resend verification code */}
      <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => context.closeModal(id)}>
        {`${t('okay')}`}
      </Button>
    </Paper>
  );
}
