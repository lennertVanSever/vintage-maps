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

export const getExtremes = ({ x, y, width, height }, padding = 0) => {
  const round = (number, type) => Math[type](number * 10) / 10;
  return {
    left: round(x, 'floor') - padding,
    right: round(x + width, 'ceil') + padding,
    top: round(y, 'floor') - padding,
    bottom: round(y + height, 'ceil') + padding,
  };
};

export const isOverlapping = (city1, city2) => {
  // todo: make a unit test here to optimize function
  let overlapLeft = false;
  let overlapRight = false;
  let overlapTop = false;
  let overlapBottom = false;
  if (city1.left >= city2.left && city1.left <= city2.right) {
    overlapLeft = true;
  }
  if (city2.left >= city1.left && city2.left <= city1.right) {
    overlapLeft = true;
  }
  if (city1.right <= city2.right && city1.right >= city2.left) {
    overlapRight = true;
  }
  // // console.log(city2, city1);
  if (city2.left >= city1.left && city2.left <= city1.right) {
    // revisit this part later, can be optimized
    overlapRight = true;
    overlapLeft = true;
  }

  if (city1.top <= city2.top && city1.bottom >= city2.bottom) {
    overlapTop = true;
    overlapBottom = true;
  }

  if (
    city1.top >= city2.top &&
    city1.top <= city2.bottom &&
    city1.bottom >= city2.bottom
  ) {
    overlapTop = true;
  }

  if (
    city1.bottom >= city2.top &&
    city1.top <= city2.top &&
    city1.bottom <= city2.bottom
  ) {
    overlapBottom = true;
  }

  return (
    (overlapLeft && overlapBottom) ||
    (overlapLeft && overlapTop) ||
    (overlapRight && overlapBottom) ||
    (overlapRight && overlapTop)
  );
};
