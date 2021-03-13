const mountains = require('../scripts/map/mountains/dataOriginal.json');
const fs = require('fs');
const path = require('path');
const { distance } = require('./utils/coordinates.js');

const maximumDistanceInKm = 25;

mountains.features = mountains.features
  .map(
    ({
      type,
      geometry,
      properties: { meters, latitude, longitude, name },
    }) => ({
      type,
      geometry,
      properties: { meters, latitude, longitude, name },
    })
  )
  .filter(({ properties: { meters } }) => {
    return meters > 500;
  })
  .filter(({ properties: mountain1 }) => {
    let shouldStay = true;
    mountains.features.forEach(({ properties: mountain2 }) => {
      if (mountain1.name !== mountain2.name) {
        const distanceBetweenMountains = distance(
          mountain1.latitude,
          mountain1.longitude,
          mountain2.latitude,
          mountain2.longitude
        );
        if (
          distanceBetweenMountains < maximumDistanceInKm &&
          mountain1.meters < mountain2.meters
        ) {
          shouldStay = false;
        }
      }
    });
    return shouldStay;
  });

fs.writeFileSync(
  path.resolve(__dirname, `../scripts/map/mountains/data.json`),
  JSON.stringify(mountains)
);
