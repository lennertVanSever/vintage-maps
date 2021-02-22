export const initialUrl = new URL(window.location.href);

export const fallBackTitle = 'Change me';

export const initial = {
  title: initialUrl.searchParams.get('title') || fallBackTitle,
  direction: 'landscape',
  style: 'defaultColors',
  size: {
    value: '60x40',
    label: '60cm x 40cm',
  },
  material: {
    value: 'canvas',
    label: 'Canvas',
  },
};
