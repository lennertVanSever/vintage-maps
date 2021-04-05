import * as Sentry from '@sentry/browser';
import { map } from '../index.js';
import {
  addParameterToURL,
  dispatchCustomEvent,
  initial,
  isLocalHost,
} from '../utils';

const { serverUrl, stripePublicKey } = (() => {
  const manuallyForceProduction = true && isLocalHost;
  const isProduction = window.location.origin === 'https://vintagemap.app';
  const production = {
    serverUrl: 'https://vintage-map-server.herokuapp.com',
    stripePublicKey:
      'pk_live_51IPXmRAyNgTukX9zVkO2GZHWRE1wV0tXLmXOX7q3LiNfyrJLu7OFEj6yUCu6mWcCfaCuzQuDX5yuwXcTdVcNj2gr00UtV0GEpi',
  };
  const development = {
    serverUrl: 'https://vintage-map-server-development.herokuapp.com',
    stripePublicKey:
      'pk_test_51IPXmRAyNgTukX9zBreHfqpRKgCO8c5oDkpNHQxnTVy9xDY5D1TP8o9tax4ZmgAYSo3fGFpOMpEatP5DxCiAWIjR001cHiZQwx',
  };
  if (isProduction || manuallyForceProduction) {
    return production;
  }
  return development;
})();

const fetchPrintToken = async () => {
  const responseRaw = await fetch(`${serverUrl}/print_key`);
  return responseRaw.json();
};

export const goToPayment = async ({ id, checkout: { setupUrl }, shipping }) => {
  const { access_token: accessToken } = await fetchPrintToken();
  addParameterToURL('orderId', id);
  const responseRaw = await fetch(setupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      returnUrl: `${window.location.origin}/status-order${window.location.search}`,
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
    const {
      access_token: accessToken,
      api_url: apiUrl,
    } = await fetchPrintToken();
    const responseRaw = await fetch(`${apiUrl}/v2/orders`, {
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
  const {
    access_token: accessToken,
    api_url: apiUrl,
  } = await fetchPrintToken();
  const responseRaw = await fetch(`${apiUrl}/v2/orders/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return responseRaw.json();
};

const addGeneratedCssVariables = css => {
  let cssVariablesConcatenated = '';
  Object.keys(document.documentElement.style).forEach(key => {
    if (Number.isInteger(Number(key))) {
      const cssVariableName = document.documentElement.style[key];
      const cssVariableValue = getComputedStyle(
        document.documentElement
      ).getPropertyValue(cssVariableName);
      cssVariablesConcatenated += ` ${cssVariableName}: ${cssVariableValue};`;
    }
  });
  return css.replace('}', `${cssVariablesConcatenated}}`);
};

export const getMapHtml = type => {
  const subWrapper = document.getElementById('mapSection');
  const allCSS = [...document.styleSheets]
    .map(styleSheet => {
      try {
        return [...styleSheet.cssRules]
          .map(rule => {
            if (rule.selectorText === ':root') {
              return addGeneratedCssVariables(rule.cssText);
            }
            return rule.cssText;
          })
          .join('');
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
  const links = Array.from(document.querySelectorAll('link'))
    .map(link => link.outerHTML)
    .join('');
  return `
    <head>
      <meta charset="utf-8">
      ${links}
      <style>
        #subWrapper {
          position: absolute;
          left: 0px;
          right: 0px;
          top: 0;
          box-shadow: none !important;
          margin: 0px !important;
          height: 100% !important;
          width: 100% !important;
          page-break-inside: avoid;
          ${type === 'PRINT' ? 'padding: 3mm;' : ''}
        }
        .svg_wrapper {
          ${type === 'PRINT' ? 'border: 1px solid red;' : ''}
        }
        * {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        ${allCSS}
      </style>
    </head>
    ${subWrapper.innerHTML}
  `;
};

export const generateMapUrl = async (printExactSize, type) => {
  // console.log({ printExactSize });
  // map.bleedCorrection = -120;
  map.addBleedCorrection(printExactSize);
  const htmlCode = getMapHtml(type);
  try {
    dispatchCustomEvent('mapUrl', {
      data: null,
      state: 'LOADING',
    });
    const responseRaw = await fetch(`${serverUrl}/upload_map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sejdaParameters: {
          pageSize: printExactSize,
          htmlCode,
        },
      }),
    });
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

class CalculatePrice {
  constructor() {
    this.size = initial.size;
    this.material = initial.material;
    this.calculatePrice();
    window.addEventListener('sizeChange', this.handleSizeChange.bind(this));
    window.addEventListener(
      'materialChange',
      this.handleMaterialChange.bind(this)
    );
  }

  handleSizeChange({ detail }) {
    this.size = detail;
    this.calculatePrice();
  }

  handleMaterialChange({ detail }) {
    this.material = detail;
    this.calculatePrice();
  }

  get productNameId() {
    return `${this.material.value}_${this.size.value}`;
  }

  get productName() {
    return `Map ${this.material.label} ${this.size.label}`;
  }

  async calculatePrice() {
    const {
      access_token: accessToken,
      api_url: apiUrl,
    } = await fetchPrintToken();
    const responseRaw = await fetch(
      `${apiUrl}/v2/products/${this.productNameId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const response = await responseRaw.json();
    const {
      files: [{ width, height }],
    } = response;
    dispatchCustomEvent('productChange', {
      id: response.id,
      price: response.checkout.base,
      name: this.productName,
      printExactSize: `${width}mmx${height}mm`,
    });
  }
}

setTimeout(() => {
  new CalculatePrice(); // otherwise we get initialize error
}, 0);

export const stripeCheckout = pdfFile => {
  addParameterToURL('pdfFile', pdfFile);
  const stripe = Stripe(stripePublicKey);

  fetch(`${serverUrl}/pay-downloaded-map`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin: window.location.origin,
      searchParameters: window.location.search,
    }),
  })
    .then(response => {
      return response.json();
    })
    .then(session => {
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(result => {
      if (result.error) {
        Sentry.captureException(result.error.message);
        alert(result.error.message);
      }
    })
    .catch(error => {
      Sentry.captureException(error);
      console.error('Error:', error);
    });
};
