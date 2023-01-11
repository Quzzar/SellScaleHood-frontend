import { Button, Group, NumberInput, Input } from "@mantine/core";
import { useForm } from "@mantine/form";
import { hideNotification, showNotification, updateNotification } from "@mantine/notifications";
import { IconChartInfographic, IconCheck, IconX } from "@tabler/icons";
import { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../contexts/user";


export default function StockTransaction({ ticker, cur, price, buying, max }: { ticker: string, cur: string, price: number, buying: boolean, max?: number }) {

  const { t } = useTranslation();
  const qtyRef = useRef<HTMLInputElement>(null);
  const userContext = useContext(UserContext);

  const form = useForm({
    initialValues: {
      qty: 1,
    },
  });

  // If user is NOT logged in, don't display
  if (!userContext.user.localId) {
    return (
      <></>
    );
  }

  const handleTransaction = async (values: typeof form.values) => {

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) { return; }

    if(+values.qty <= 0 || (max && +values.qty > max)){ return; }

    console.log(`${buying ? 'Buying' : 'Selling'} stock "${ticker}"...`);
    hideNotification('buy-stock');
    showNotification({
      id: 'buy-stock',
      loading: true,
      title: `${t((buying ? 'buying' : 'selling')+'Start')}`.replace('{STOCK}', `${ticker} × ${values.qty}`),
      message: `${t((buying ? 'buying' : 'selling')+'StartDesc')}`,
      autoClose: false,
      disallowClose: true,
    });

    const showError = (message: string) => {
      updateNotification({
        id: 'buy-stock',
        autoClose: 5000,
        title: `${t((buying ? 'buying' : 'selling')+'Error')}`,
        message,
        color: 'red',
        icon: <IconX />,
      });
    };

    // Make request to backend to purchase stock (see: api/buy.py)
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/${buying ? 'buy' : 'sell'}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ticker: ticker,
        qty: +values.qty,
      }),
    });
    const res = await response.json();

    switch (res.message) {
      case 'SERVICE_OFFLINE':
        showError(t('authOffline')+'');
        return;
      case 'SERVICE_NOT_IMPLEMENTED':
        showError(t('notImplemented')+'');
        return;
      case 'INVALID_HEADER':
        showError(t((buying ? 'buying' : 'selling')+'InvalidHeader') + '');
        return;
      case 'INVALID_BODY':
        showError(t((buying ? 'buying' : 'selling')+'InvalidBody') + '');
        return;
      case 'QTY_NOT_VALID':
        showError(t((buying ? 'buying' : 'selling')+'InvalidQty') + '');
        return;
      case 'STOCK_NOT_FOUND':
        showError(t((buying ? 'buying' : 'selling')+'StockNotFound') + '');
        return;
      case 'INVALID_ID_TOKEN':
        /* If we have an invalid access token, it probably means the system in place
         * in App.tsx is currently occuring and we're about to update our tokens.
         * If that's the case, we should wait for the tokens to be updated and reattempt
         * this query.
         * TODO: For now, let's just wait and reload because that's an easy solution but
         * in the future a better solution would be to just recall this query when ready.
         */
        setTimeout(() => {
          window.location.reload();
        }, 5000);
        return;
      case '':
        console.log(`Successfully ${buying ? 'bought' : 'sold'} stock`, res);
        updateNotification({
          id: 'buy-stock',
          autoClose: 5000,
          title: `${t((buying ? 'buying' : 'selling')+'Success')}`.replace('{STOCK}', `${ticker} × ${values.qty}`),
          message: `${t((buying ? 'buying' : 'selling')+'SuccessDesc')}`.replace('{STOCK}', `${ticker}`).replace('{PRICE}', `${cur}${res.data.price}`),
          color: 'cyan',
          icon: <IconCheck />,
        });
        return;
      default:
        showError(t('unknownIssue') + ': ' + res.message);
        return;
    }

  };

  return (
    <form onSubmit={form.onSubmit(handleTransaction)}>
      <Group position="center" grow>
        <Input
          icon={<IconChartInfographic />}
          placeholder="Current price"
          value={cur + price}
          variant="filled"
          disabled
          styles={{
            input: {
              cursor: 'text!important',
            }
          }}
        />
        <NumberInput
          max={max}
          min={1}
          ref={qtyRef}
          required
          placeholder={`${t('quantity')}`}
          {...form.getInputProps('qty')}
        />
        <Button variant="light" color="cyan" radius="md" type="submit">
          {`${buying ? t('buy') : t('sell')}`}
        </Button>
      </Group>
    </form>
  );

}