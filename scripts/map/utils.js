import * as d3 from 'd3';
import { defaultColors } from './colors.js';

export function mapRange(value, low1, high1, low2, high2) {
  const result = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  if (result < low2) return low2;
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export const resetAlreadySelected = () => {
  d3.selectAll('.insideBorderLight').attr('fill', 'none');
  d3.selectAll('.cityPath').attr('fill', defaultColors.text);
  d3.selectAll('.cityName').attr('fill', defaultColors.text);
  d3.selectAll('.riverShadow')
    .attr('stroke', 'transparent')
    .attr('stroke-width', 1);
};
export const camalize = str => {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const getCountryId = country => {
  return country.properties.ID;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
