import Navigo from 'navigo';
import { getMapHtml } from '../checkout';

export const router = new Navigo('/');

const openSection = name => {
  const newCustomEvent = new CustomEvent('showSection', {
    detail: {
      name,
    },
  });
  setTimeout(() => {
    // https://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
    window.dispatchEvent(newCustomEvent);
  });
};

router.on('/', () => {
  openSection('/');
});

router.on('/order', async () => {
  // const responseRaw = await fetch(
  //   'https://vintage-maps-functions.netlify.app/.netlify/functions/upload_map',
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       sejdaParameters: {
  //         htmlCode: getMapHtml(),
  //       },
  //     }),
  //   }
  // );
  // const response = await responseRaw.json();

  openSection('/order');
  // console.log(response);
});

router.on('/checkout', () => {
  openSection('/checkout');
});

router.on('/status-order', () => {
  openSection('/status-order');
});

router.resolve();
