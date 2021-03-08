import { projectionNames, years } from '../config';
import { getInitialUrlParameter } from './url';

export const initialUrl = new URL(window.location.href);

export const fallBackTitle = 'Change me';

export const initial = {
  title: getInitialUrlParameter('title') || fallBackTitle,
  direction: getInitialUrlParameter('direction') || 'landscape',
  style: getInitialUrlParameter('style') || 'defaultColors',
  size: {
    value: getInitialUrlParameter('sizeValue') || '60x40',
    label: getInitialUrlParameter('sizeLabel') || '60cm x 40cm',
  },
  material: {
    value: getInitialUrlParameter('materialValue') || 'canvas',
    label: getInitialUrlParameter('materialLabel') || 'Canvas',
  },
  hideOrShow: {
    graticuleCollection:
      getInitialUrlParameter('graticuleCollection') || 'true',
    cities: getInitialUrlParameter('cities') || 'true',
    rivers: getInitialUrlParameter('rivers') || 'true',
  },
  year: getInitialUrlParameter('year') || years[0],
  borderWidth: getInitialUrlParameter('borderWidth') || 10,
  citySize: getInitialUrlParameter('citySize') || 3,
  graticuleGapSize: getInitialUrlParameter('graticuleGapSize') || 50,
  graticuleLineSize: getInitialUrlParameter('graticuleLineSize') || 1,
  language: getInitialUrlParameter('language') || 'en',
  font: getInitialUrlParameter('font') || 'Bellefair',
  projectionName: getInitialUrlParameter('projection') || projectionNames[0],
  transform: {
    k: getInitialUrlParameter('k') || 1,
    x: getInitialUrlParameter('x') || 0,
    y: getInitialUrlParameter('y') || 0,
  },
};
