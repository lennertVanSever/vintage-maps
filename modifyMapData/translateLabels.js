require('dotenv').config();
const { getWorlds, saveWorld } = require('./utils/worlds');
const { asyncForEach } = require('./utils/async');
const cities = require('../scripts/map/cities/data.json');
const fetch = require('node-fetch');
const languages = require('../scripts/config/languages.json');
const fs = require('fs');
const path = require('path');

const getTranslations = async (body, languageSelection) => {
  const responseRaw = await fetch(
    `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&${languageSelection}&from=en`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATE_KEY,
        'Ocp-Apim-Subscription-Region': 'westeurope',
        'Content-Type': 'application/json',
      },
    }
  );
  return responseRaw.json();
};

// console.log(languages);

const languagesQuery = (() => {
  return Object.keys(languages)
    .map(key => {
      return `to=${key}`;
    })
    .join('&');
})();

const convertTranslationToKeyValueObject = input => {
  if (!input[0].text) return {};
  const returnObject = {};
  input.forEach(({ text, to }) => {
    returnObject[to] = text;
  });
  return returnObject;
};

const translateCountries = () =>
  getWorlds(async (world, fileName) => {
    await asyncForEach(world.features, async (feature, index) => {
      const { NAME: name } = feature.properties;
      if (name && name !== 'unclaimed') {
        const rawTranslations = await getTranslations(
          [{ Text: name }],
          languagesQuery
        );
        world.features[index].properties.translations = {
          ...convertTranslationToKeyValueObject(
            rawTranslations[0].translations
          ),
          en: name,
        };
        console.info(`translated ${name}`);
      }
    });
    saveWorld(world, fileName);
  });

const translateCities = async () => {
  await asyncForEach(cities.features, async (city, index) => {
    const { NAME: name } = city.properties;

    const rawTranslations = await getTranslations(
      [{ Text: name }],
      languagesQuery
    );
    cities.features[index].properties.translations = {
      ...convertTranslationToKeyValueObject(rawTranslations[0].translations),
      en: name,
    };

    console.info(`translated ${name}`);
  });
  fs.writeFileSync(
    path.resolve(__dirname, `../scripts/map/cities/data.json`),
    JSON.stringify(cities)
  );
  console.info(`updated cities`);
};

translateCities();
