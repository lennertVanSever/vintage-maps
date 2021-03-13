const { getWorlds, saveWorld } = require('./utils/worlds');
const { v4: uuid } = require('uuid');

getWorlds((world, fileName) => {
  world.features = world.features.map(features => ({
    ...features,
    properties: {
      ...features.properties,
      ID: uuid(),
    },
  }));

  saveWorld(world, fileName);
});
