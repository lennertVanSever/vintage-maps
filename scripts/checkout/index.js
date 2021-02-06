import { dispatchCustomEvent } from '../utils';

const fetchPrintToken = async () => {
  const responseRaw = await fetch(
    'http://localhost:9000/.netlify/functions/print_key'
  );
  return responseRaw.json();
};

export const goToPayment = async ({ id, checkout: { setupUrl }, shipping }) => {
  const { access_token: accessToken } = await fetchPrintToken();
  const responseRaw = await fetch(setupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      returnUrl: `http://localhost:8080/status-order${window.location.search}&orderId=${id}`,
      billing: shipping,
    }),
  });
  const response = await responseRaw.json();
  const { paymentUrl } = response;
  if (paymentUrl) window.location.href = paymentUrl;
};

export const orderPrint = async orderData => {
  try {
    dispatchCustomEvent('orderData', {
      data: null,
      state: 'LOADING',
    });
    const { access_token: accessToken } = await fetchPrintToken();
    const responseRaw = await fetch('https://test.printapi.nl/v2/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });
    const response = await responseRaw.json();
    dispatchCustomEvent('orderData', {
      data: response,
      state: 'SUCCESS',
    });
  } catch (e) {
    dispatchCustomEvent('orderData', {
      data: e,
      state: 'ERROR',
    });
    console.error('something went wrong', e);
  }
};

export const getOrderDetails = async ({ id }) => {
  const { access_token: accessToken } = await fetchPrintToken();
  const responseRaw = await fetch(`https://test.printapi.nl/v2/orders/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return responseRaw.json();
};

export const getMapHtml = () => {
  const subWrapper = document.getElementById('mapSection');
  const allCSS = [...document.styleSheets]
    .map(styleSheet => {
      try {
        return [...styleSheet.cssRules].map(rule => rule.cssText).join('');
      } catch (e) {
        console.error(
          'Access to stylesheet %s is denied. Ignoring...',
          styleSheet.href
        );
        return null;
      }
    })
    .filter(Boolean)
    .join('\n');
  return `
    <style>
      #subWrapper {
        position: absolute;
        left: 0px;
        right: 0px;
        margin: auto;
        margin-top: 10px;
        height: calc(100% - 50px) !important;
        width: calc(100% - 70px) !important;
        page-break-inside: avoid;
      }
      * {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      ${allCSS}
    </style>
    ${subWrapper.innerHTML}
  `;
};

export const generateMapUrl = async () => {
  try {
    dispatchCustomEvent('mapUrl', {
      data: null,
      state: 'LOADING',
    });
    console.log('generating map');
    const responseRaw = await fetch(
      'https://vintage-maps-functions.netlify.app/.netlify/functions/upload_map',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sejdaParameters: {
            pageSize: '406mmx306mm',
            htmlCode: getMapHtml(),
          },
        }),
      }
    );
    const response = await responseRaw.json();
    dispatchCustomEvent('mapUrl', {
      data: response,
      state: 'SUCCESS',
    });
  } catch (e) {
    dispatchCustomEvent('mapUrl', {
      data: e,
      state: 'ERROR',
    });
  }
};
