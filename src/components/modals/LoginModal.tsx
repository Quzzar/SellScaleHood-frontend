import { Anchor, Button, Checkbox, Group, LoadingOverlay, Text, Paper, PasswordInput, TextInput, useMantineTheme, Title } from "@mantine/core";
import { useForm } from '@mantine/form';
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { IconAt, IconLock } from "@tabler/icons";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { GRADIENT_COLORS } from "../../constants/data";
import { UserContext } from "../../contexts/user";

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export default function LoginModal({ context, id, innerProps }: ContextModalProps<{ form: 'register' | 'login' }>) {

  const { t } = useTranslation();
  const [formType, setFormType] = useState<'register' | 'login'>(innerProps.form);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();
  const userContext = useContext(UserContext);

  const toggleFormType = () => {
    setFormType((current) => (current === 'register' ? 'login' : 'register'));
    setError(null);
  };

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsOfService: true,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);

    if(formType === 'register'){
      handleRegister(values);
    } else {
      handleLogin(values);
    }
  }

  const handleLogin = async (values: typeof form.values) => {

    if(!values.email.match(emailRegex)){
      setError(t('loginNotAnEmail')+'');
      return;
    }

    setLoading(true);

    // Make request to backend to login (see: api/auth/login.py)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });
    const res = await response.json();

    setLoading(false);

    switch (res.message) {
      case 'SERVICE_OFFLINE':
        setError(t('authOffline')+'');
        return;
      case 'EMAIL_NOT_VERIFIED':
        setError(t('loginEmailNotVerified')+'');
        return;
      case 'EMAIL_NOT_FOUND':
        setError(t('loginInvalidEmail')+'');
        return;
      case 'INVALID_EMAIL':
        setError(t('loginInvalidEmail')+'');
        return;
      case 'INVALID_PASSWORD':
        setError(t('loginInvalidPassword')+'');
        return;
      case '':
        console.log('Login Successful', res)
        
        userContext.setUser({
          localId: res.data.localId,
          email: res.data.email,
          displayName: res.data.displayName,
        });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        context.closeModal(id);
        return;
      default:
        setError(t('unknownIssue')+': '+res.message);
        return;
    }

  };
  
  const handleRegister = async (values: typeof form.values) => {

    if(values.password !== values.confirmPassword){
      setError(`${t('registerPasswordsNoMatch')}`);
      return;
    }

    if(!values.email.match(emailRegex)){
      setError(`${t('loginNotAnEmail')}`);
      return;
    }

    if(!values.termsOfService){
      setError(`${t('registerTermsofService')}`);
      return;
    }

    setLoading(true);

    // Make request to backend to register (see: api/auth/register.py)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        displayName: `${values.firstName} ${values.lastName}`
      }),
    });
    const res = await response.json();

    setLoading(false);

    switch (res.message) {
      case 'SERVICE_OFFLINE':
        setError(t('authOffline')+'');
        return;
      case 'EMAIL_EXISTS':
        setError(t('registerEmailInUse')+'');
        return;
      case '':
        console.log('Register Successful', res)
        context.closeModal(id);

        openContextModal({
          modal: 'verifyEmail',
          title: (<Title order={3}>{`${t('registerVerifyEmail')}`}</Title>),
          innerProps: {},
        });

        return;
      default:
        setError(t('unknownIssue')+': '+res.message);
        return;
    }

  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />
        {formType === 'register' && (
          <Group grow>
            <TextInput
              data-autofocus
              required
              placeholder={`${t('registerFirstName')}`}
              label={`${t('registerFirstName')}`}
              {...form.getInputProps('firstName')}
            />

            <TextInput
              required
              placeholder={`${t('registerLastName')}`}
              label={`${t('registerLastName')}`}
              {...form.getInputProps('lastName')}
            />
          </Group>
        )}

        <TextInput
          mt="md"
          required
          placeholder={`${t('registerEmail')}`}
          label={`${t('registerEmail')}`}
          icon={<IconAt size={16} stroke={1.5} />}
          {...form.getInputProps('email')}
        />

        <PasswordInput
          mt="md"
          required
          placeholder={`${t('registerPassword')}`}
          label={`${t('registerPassword')}`}
          icon={<IconLock size={16} stroke={1.5} />}
          {...form.getInputProps('password')}
        />

        {formType === 'register' && (
          <PasswordInput
            mt="md"
            required
            label={`${t('registerConfirmPassword')}`}
            placeholder={`${t('registerConfirmPassword')}`}
            icon={<IconLock size={16} stroke={1.5} />}
            {...form.getInputProps('confirmPassword')}
          />
        )}

        {formType === 'register' && (
          <Checkbox
            mt="xl"
            color="cyan"
            label={`${t('registerTermsofServiceLabel')}`}
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />
        )}

        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {(
          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              color="dimmed"
              onClick={toggleFormType}
              size="sm"
            >
              {formType === 'register'
                ? `${t('hasAccountLogin')}`
                : `${t('noAccountRegister')}`}
            </Anchor>

            <Button variant="gradient" gradient={{ from: GRADIENT_COLORS[2], to: GRADIENT_COLORS[4], deg: 115 }} radius="md" type="submit">
              {formType === 'register' ? `${t('register')}` : `${t('login')}`}
            </Button>
          </Group>
        )}
      </form>
    </Paper>
  );
}
