import * as d3 from 'd3';
import colors from './colors.js';

export function mapRange(value, low1, high1, low2, high2) {
  const result = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  if (result < low2) return low2;
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export const resetAlreadySelected = () => {
  d3.selectAll('.insideBorderLight').attr('fill', 'none');
  d3.selectAll('.cityPath').attr('fill', colors.text);
  d3.selectAll('.cityName').attr('fill', colors.text);
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

export const getCountryNameCamelCase = country => {
  return camalize(country.properties.NAME);
};

export function addParameterToURL(key, value) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set(key, value);
  window.history.replaceState({}, '', newUrl.href);
}

export function addParametersToURL(data) {
  const newUrl = new URL(window.location.href);
  Object.keys(data).forEach(key => {
    const value = data[key];
    newUrl.searchParams.set(key, value);
  });
  window.history.pushState({}, '', newUrl.href);
}

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

// https://github.com/mapbox/polylabel
export function polylabel(polygon, precision, debug) {
  precision = precision || 1.0;
  // find the bounding box of the outer ring
  let minX;
  let minY;
  let maxX;
  let maxY;
  for (let i = 0; i < polygon[0].length; i++) {
    const p = polygon[0][i];
    if (!i || p[0] < minX) minX = p[0];
    if (!i || p[1] < minY) minY = p[1];
    if (!i || p[0] > maxX) maxX = p[0];
    if (!i || p[1] > maxY) maxY = p[1];
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.min(width, height);
  let h = cellSize / 2;
  // a priority queue of cells in order of their "potential" (max distance to polygon)
  const cellQueue = new TinyQueue([], compareMax);

  if (cellSize === 0) return [minX, minY];

  // cover polygon with initial cells
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cellQueue.push(new Cell(x + h, y + h, h, polygon));
    }
  }

  // take centroid as the first best guess
  let bestCell = getCentroidCell(polygon);

  // special case for rectangular polygons
  const bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
  if (bboxCell.d > bestCell.d) bestCell = bboxCell;

  let numProbes = cellQueue.length;
  while (cellQueue.length) {
    // pick the most promising cell from the queue
    const cell = cellQueue.pop();

    // update the best cell if we found a better one
    if (cell.d > bestCell.d) {
      bestCell = cell;
      if (debug)
        console.log(
          'found best %d after %d probes',
          Math.round(1e4 * cell.d) / 1e4,
          numProbes
        );
    }

    // do not drill down further if there's no chance of a better solution
    if (cell.max - bestCell.d <= precision) continue;

    // split the cell into four cells
    h = cell.h / 2;
    cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
    cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
    cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
    cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
    numProbes += 4;
  }

  if (debug) {
    console.log(`num probes: ${numProbes}`);
    console.log(`best distance: ${bestCell.d}`);
  }
  // console.log(bestCell, countryName);
  return bestCell;
}

function compareMax(a, b) {
  return b.max - a.max;
}

function Cell(x, y, h, polygon) {
  this.x = x; // cell center x
  this.y = y; // cell center y
  this.h = h; // half the cell size
  this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
  this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
  let inside = false;
  let minDistSq = Infinity;

  for (let k = 0; k < polygon.length; k++) {
    const ring = polygon[k];

    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i];
      const b = ring[j];

      if (
        a[1] > y !== b[1] > y &&
        x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
      )
        inside = !inside;

      minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
    }
  }

  return (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroidCell(polygon) {
  let area = 0;
  let x = 0;
  let y = 0;
  const points = polygon[0];

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const a = points[i];
    const b = points[j];
    const f = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * f;
    y += (a[1] + b[1]) * f;
    area += f * 3;
  }
  if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon);
  return new Cell(x / area, y / area, 0, polygon);
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = px - x;
  dy = py - y;

  return dx * dx + dy * dy;
}

// https://github.com/mourner/tinyqueue/blob/master/index.js
class TinyQueue {
  constructor(data = [], compare = defaultCompare) {
    this.data = data;
    this.length = this.data.length;
    this.compare = compare;

    if (this.length > 0) {
      for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
    }
  }

  push(item) {
    this.data.push(item);
    this._up(this.length++);
  }

  pop() {
    if (this.length === 0) return undefined;

    const top = this.data[0];
    const bottom = this.data.pop();

    if (--this.length > 0) {
      this.data[0] = bottom;
      this._down(0);
    }

    return top;
  }

  peek() {
    return this.data[0];
  }

  _up(pos) {
    const { data, compare } = this;
    const item = data[pos];

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) break;
      data[pos] = current;
      pos = parent;
    }

    data[pos] = item;
  }

  _down(pos) {
    const { data, compare } = this;
    const halfLength = this.length >> 1;
    const item = data[pos];

    while (pos < halfLength) {
      let bestChild = (pos << 1) + 1; // initially it is the left child
      const right = bestChild + 1;

      if (right < this.length && compare(data[right], data[bestChild]) < 0) {
        bestChild = right;
      }
      if (compare(data[bestChild], item) >= 0) break;

      data[pos] = data[bestChild];
      pos = bestChild;
    }

    data[pos] = item;
  }
}

function defaultCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
