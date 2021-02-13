export const initialUrl = new URL(window.location.href);

export const initial = {
  title: initialUrl.searchParams.get('title') || 'Change me',
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
