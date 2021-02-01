import Navigo from 'navigo';
import { getMapHtml } from '../checkout';

export const router = new Navigo('/');

router.on('/order', async () => {
  const responseRaw = await fetch(
    'https://vintage-maps-functions.netlify.app/.netlify/functions/upload_map',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sejdaParameters: {
          htmlCode: getMapHtml(),
        },
      }),
    }
  );
  const response = await responseRaw.json();
  console.log(response);
});

router.resolve();
