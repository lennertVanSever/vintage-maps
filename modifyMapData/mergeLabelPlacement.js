const { getWorlds, saveWorld } = require('./utils/worlds');

getWorlds((world, fileName) => {
  world.features = world.features.map(features => {
    const labelPlacement = features.properties.CUSTOM_LABEL_PLACEMENT
      ? features.properties.CUSTOM_LABEL_PLACEMENT
      : features.properties.LABEL_PLACEMENT;
    delete features.properties.CUSTOM_LABEL_PLACEMENT;
    return {
      ...features,
      properties: {
        ...features.properties,
        LABEL_PLACEMENT: labelPlacement,
      },
    };
  });

  saveWorld(world, fileName);
});
