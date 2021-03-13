import Navigo from 'navigo';

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
  openSection('/order');
});

router.on('/checkout', () => {
  openSection('/checkout');
});

router.on('/status-order', () => {
  openSection('/status-order');
});

router.on('/prepare-download', () => {
  openSection('/prepare-download');
});

router.on('/download-success', () => {
  openSection('/download-success');
});

router.on('/download-fail', () => {
  openSection('/download-fail');
});

router.resolve();
