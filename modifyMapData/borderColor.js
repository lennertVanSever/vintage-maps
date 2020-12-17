const { WelshPowell } = require('./utils/algorithm');
const { getWorlds, saveWorld } = require('./utils/worlds');

getWorlds((world, fileName) => {
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

  saveWorld(world, fileName);
});
