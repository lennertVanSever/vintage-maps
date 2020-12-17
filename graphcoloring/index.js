const fs = require('fs');
const path = require('path');
const { WelshPowell } = require('./algorithm');

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
    path.resolve(__dirname, `./withBorders/${fileName}`)
  );

  const world = JSON.parse(worldRaw);
  const countryNameIndex = {};
  world.features.forEach(({ properties: { NAME } }, index) => {
    countryNameIndex[NAME] = index;
  });

  const adjancencyList = world.features.map(country => {
    const relationships = country.properties.BORDERING.map(countryName => {
      return countryNameIndex[countryName];
    });
    return relationships;
  });

  const wp = new WelshPowell();
  wp.init(adjancencyList);
  const graphColored = wp.compute();

  world.features = world.features.map((country, index) => {
    country.properties.BORDER_COLOR_INDEX = graphColored[index].color;
    return country;
  });

  try {
    fs.writeFileSync(
      `./withColorBorderIndex/${fileName}`,
      JSON.stringify(world)
    );
    console.log(`succesfully updated ${fileName}`);
  } catch (e) {
    console.log('error writing file', e);
  }
});
