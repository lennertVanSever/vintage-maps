const swedenTest = [
  [9, 23],
  [2, 21],
  [2, 17],
  [4, 13],
  [6, 8],
  [11, 6],
  [17, 7],
  [20, 9],
  [21, 13],
  [22, 16],
  [21, 19],
  [20, 21],
  [18, 23],
  [14, 23],
  [15, 19],
  [14, 16],
  [17, 14],
  [16, 12],
  [10, 12],
  [9, 14],
  [10, 16],
  [9, 18],
  [10, 20],
  [9, 23],
];

const belgiumTest = [
  [7, 15],
  [6, 12],
  [4, 7],
  [3, 5],
  [15, 5],
  [14, 7],
  [14, 10],
  [12, 13],
  [10, 15],
];

const chickenTest = [
  [1, 8],
  [9, 8],
  [10, 5],
  [10, 2],
  [14, 2],
  [14, 5],
  [12, 8],
  [10, 11],
  [9, 14],
  [5, 14],
  [4, 11],
];

function mapRange(value, low1, high1, low2, high2) {
  const result = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  if (result < low2) return low2;
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  // https://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) {
    return null;
  }
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return {
    intersectX: x1 + ua * (x2 - x1),
    intersectY: y1 + ua * (y2 - y1),
    isIntersecting1: ua >= 0 && ua <= 1,
    isIntersecting2: ub >= 0 && ub <= 1,
  };
}

function getBoundingBox(polygon) {
  let minX;
  let minY;
  let maxX;
  let maxY;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    if (!i || p[0] < minX) [minX] = p;
    if (!i || p[1] < minY) [, minY] = p;
    if (!i || p[0] > maxX) [maxX] = p;
    if (!i || p[1] > maxY) [, maxY] = p;
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

function findIntersections(polygon, resolution, boundingBox) {
  const { minX, minY, maxX, maxY } = boundingBox;
  // x1 minX
  // y1 maxY
  // x2 maxX
  // y2 maxY
  const globalIntersectPoints = [];
  for (let i = maxY; i > minY; i -= resolution) {
    const localIntersectPoints = [];
    const controllerX1 = minX;
    const controllerY1 = i;
    const controllerX2 = maxX;
    const controllerY2 = i;

    polygon.forEach(([polygonX1, polygonY1], index) => {
      if (polygon[index + 1]) {
        const [polygonX2, polygonY2] = polygon[index + 1];
        const calculatedLineIntersect = lineIntersect(
          polygonX1,
          polygonY1,
          polygonX2,
          polygonY2,
          controllerX1,
          controllerY1,
          controllerX2,
          controllerY2
        );
        if (calculatedLineIntersect) {
          const {
            intersectX,
            intersectY,
            isIntersecting1,
            isIntersecting2,
          } = calculatedLineIntersect;
          if (isIntersecting1 && isIntersecting2) {
            let alreadySaved = false;
            localIntersectPoints.forEach(
              ([savedIntersectX, savedIntersectY]) => {
                if (
                  savedIntersectX === intersectX &&
                  savedIntersectY === intersectY
                ) {
                  alreadySaved = true;
                }
              }
            );
            if (!alreadySaved)
              localIntersectPoints.push([intersectX, intersectY]);
          }
        }
      }
    });
    if (localIntersectPoints.length > 0) {
      globalIntersectPoints.push(localIntersectPoints);
    }
  }
  return globalIntersectPoints;
}

function distance(lat1, lon1, lat2, lon2) {
  // https://www.geodatasource.com/developers/javascript
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
}

const getWidthAndHeightDistanceScore = (
  intersection,
  polygon,
  heightImportance
) => {
  // const { minY, maxY } = boundingBox;
  const [[intersectionX1, intersectionY1], [intersectionX2]] = intersection;
  const y = intersectionY1;
  const x = (intersectionX1 + intersectionX2) / 2;
  const widthDistance = Math.abs(intersectionX2 - x);
  let leastDistanceToOtherCoordinate = Infinity;

  polygon.forEach(([pointX, pointY]) => {
    const distanceToPoint = distance(pointX, pointY, x, y);
    if (leastDistanceToOtherCoordinate > distanceToPoint) {
      leastDistanceToOtherCoordinate = distanceToPoint;
    }
  });
  return widthDistance + leastDistanceToOtherCoordinate * heightImportance;
};

const findOptimalIntersection = (polygon, resolution, importanceHeight) => {
  let optimalIntersection;
  const boundingBox = getBoundingBox(polygon);
  findIntersections(polygon, resolution, boundingBox).forEach(intersections => {
    if (intersections.length === 2) {
      if (!optimalIntersection) {
        optimalIntersection = intersections;
      } else {
        const currentOptimalScore = getWidthAndHeightDistanceScore(
          optimalIntersection,
          polygon,
          importanceHeight
        );
        const newScore = getWidthAndHeightDistanceScore(
          intersections,
          polygon,
          importanceHeight
        );
        if (newScore > currentOptimalScore) {
          optimalIntersection = intersections;
        }
      }
    }
  });
  return optimalIntersection;
};

const getFontSize = (distanceValue, d) => {
  const fontSizeUnit = 'px';
  const fontSize = distanceValue / 1.8;
  let smallFactor = 1;
  const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;

  if (fontSize < 2) smallFactor = 1.5;
  if (fontSize < 0.5) smallFactor = 3;
  if (fontSize < 0.2) smallFactor = 5;
  const letterCountFactor = mapRange(letterCount, 30, 4, 0.5, 1.2);
  const maxSize = 10;
  const calculatedSize = fontSize * smallFactor * letterCountFactor;
  if (calculatedSize > maxSize) {
    return `${Math.round(maxSize)}${fontSizeUnit}`;
  }
  return `${Math.round(calculatedSize)}${fontSizeUnit}`;
};

const polylabel = (polygon, resolution, importanceHeight) => {
  const optimalIntersection = findOptimalIntersection(
    polygon,
    resolution,
    importanceHeight
  );
  if (optimalIntersection) {
    const [
      [intersectionX1, intersectionY1],
      [intersectionX2],
    ] = findOptimalIntersection(polygon, resolution, importanceHeight);
    const y = intersectionY1;
    const x = (intersectionX1 + intersectionX2) / 2;
    const d = Math.abs(intersectionX2 - x);
    return { x, y, d };
  }
  return { x: 0, y: 0, d: 0 };
};

const { getWorlds, saveWorld } = require('./utils/worlds');

getWorlds((world, fileName) => {
  world.features = world.features.map(feature => {
    const {
      geometry: { coordinates },
    } = feature;

    let longestCoordinates = [[]];

    coordinates.forEach(coordinatesCollection => {
      if (coordinatesCollection[0].length > longestCoordinates[0].length)
        longestCoordinates = coordinatesCollection;
    });

    const labelPlacement = polylabel(longestCoordinates[0], 0.1, 0.1);
    return {
      ...feature,
      properties: {
        ...feature.properties,
        LABEL_PLACEMENT: {
          X: labelPlacement.x,
          Y: labelPlacement.y,
          DISTANCE: labelPlacement.d,
          FONT_SIZE: getFontSize(labelPlacement.d, feature),
        },
      },
    };
  });
  saveWorld(world, fileName);
});
