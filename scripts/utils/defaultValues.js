import { projectionNames, years } from '../config';
import { getUrlParameter } from './url';

export const initialUrl = new URL(window.location.href);

export const fallBackTitle = 'Change me';

export const getLatestParameters = () => ({
  title: getUrlParameter('title') || fallBackTitle,
  direction: getUrlParameter('direction') || 'landscape',
  style: getUrlParameter('style') || 'defaultColors',
  size: {
    value: getUrlParameter('sizeValue') || '60x40',
    label: getUrlParameter('sizeLabel') || '60cm x 40cm',
  },
  material: {
    value: getUrlParameter('materialValue') || 'canvas',
    label: getUrlParameter('materialLabel') || 'Canvas',
  },
  hideOrShow: {
    mountains: getUrlParameter('mountains') || 'true',
    graticuleCollection: getUrlParameter('graticuleCollection') || 'true',
    cities: getUrlParameter('cities') || 'true',
    rivers: getUrlParameter('rivers') || 'true',
  },
  year: getUrlParameter('year') || years[0],
  borderWidth: getUrlParameter('borderWidth') || 10,
  citySize: getUrlParameter('citySize') || 3,
  graticuleGapSize: getUrlParameter('graticuleGapSize') || 50,
  graticuleLineSize: getUrlParameter('graticuleLineSize') || 1,
  language: getUrlParameter('language') || 'en',
  font: getUrlParameter('font') || 'Bellefair',
  projectionName: getUrlParameter('projection') || projectionNames[0],
  transform: {
    k: getUrlParameter('k') || 1,
    x: getUrlParameter('x') || 0,
    y: getUrlParameter('y') || 0,
  },
});

export const initial = getLatestParameters();
