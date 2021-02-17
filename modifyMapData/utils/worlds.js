const fs = require('fs');
const path = require('path');
const { asyncForEach } = require('./async');

const years = [
  // 'bc2000',
  // '1000',
  // '1279',
  // '1492',
  // '1530',
  '1650',
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
  // 'bc500',
];

const getWorlds = async callback => {
  asyncForEach(years, async year => {
    const fileName = `world_${year}.geojson`;
    const worldRaw = fs.readFileSync(
      path.resolve(__dirname, `../../maps/${fileName}`)
    );

    await callback(JSON.parse(worldRaw), fileName);
  });
};

const saveWorld = (world, fileName) => {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, `../../maps/${fileName}`),
      JSON.stringify(world)
    );
    console.info(`succesfully updated ${fileName}`);
  } catch (e) {
    console.info('error writing file', e);
  }
};

const isUnclaimed = name => {
  return name === null || name === 'unclaimed';
};

module.exports = { getWorlds, saveWorld, isUnclaimed };
