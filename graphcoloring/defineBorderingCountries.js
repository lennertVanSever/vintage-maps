const fs = require('fs');
const path = require('path');

const coordinateInOtherCountry = (
  countryNameToCompareWith,
  coordinatesToCheck,
  alreadyBorderingCountries,
  world
) => {
  const coordinateBorderingCountries = [];

  world.features.forEach(country => {
    const { NAME: name } = country.properties;
    if (
      countryNameToCompareWith !== name &&
      name &&
      !alreadyBorderingCountries.includes(name)
    ) {
      const stringifiedCountry = JSON.stringify(country);
      if (stringifiedCountry.includes(JSON.stringify(coordinatesToCheck))) {
        coordinateBorderingCountries.push(name);
      }
    }
  });
  return coordinateBorderingCountries;
};

[
  // 'bc2000',
  // '1000',
  // '1279',
  // '1492',
  // '1530',
  // '1650',
  // '1715',
  // '1783',
  // '1815',
  // '1880',
  // '1914',
  // '1920',
  // '1938',
  // '1945',
  // '1994',
  // '400',
  // '600',
  // '800',
  // 'bc1',
  // 'bc1000',
  // 'bc200',
  // 'bc323',
  'bc500',
].forEach(year => {
  const fileName = `world_${year}.geojson`;
  const worldRaw = fs.readFileSync(
    path.resolve(__dirname, `../maps/${fileName}`)
  );

  const world = JSON.parse(worldRaw);
  world.features = world.features.map(country => {
    const { NAME: countryName } = country.properties;
    let borderingCountries = [];
    if (countryName !== 'unclaimed' && countryName) {
      const findCoordinate = coordinates => {
        if (Array.isArray(coordinates) && Array.isArray(coordinates[0])) {
          coordinates.forEach(coordinate => findCoordinate(coordinate));
        } else {
          borderingCountries = [
            ...borderingCountries,
            ...coordinateInOtherCountry(
              countryName,
              coordinates,
              borderingCountries,
              world
            ),
          ];
        }
      };
      findCoordinate(country.geometry.coordinates);
    }
    country.properties.BORDERING = borderingCountries;
    return country;
  });

  try {
    fs.writeFileSync(`./withBorders/${fileName}`, JSON.stringify(world));
    console.log(`succesfully updated ${fileName}`);
  } catch (e) {
    console.log('error writing file', e);
  }
});
