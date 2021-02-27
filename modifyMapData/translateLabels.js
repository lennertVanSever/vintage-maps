require('dotenv').config();
const { getWorlds, saveWorld } = require('./utils/worlds');
const { asyncForEach } = require('./utils/async');

const fetch = require('node-fetch');
const languages = require('../scripts/config/languages.json');

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

getWorlds(async (world, fileName) => {
  // const translation = await getTranslations(
  //   [{ Text: 'Holy Roman Empire' }, { Text: '' }],
  //   languagesQuery
  // );

  await asyncForEach(world.features, async (feature, index) => {
    const { NAME: name } = feature.properties;
    if (name && name !== 'unclaimed') {
      const rawTranslations = await getTranslations(
        [{ Text: name }],
        languagesQuery
      );
      world.features[index].properties.translations = {
        ...convertTranslationToKeyValueObject(rawTranslations[0].translations),
        en: name,
      };
      console.info(`translated ${name}`);
    }
  });
  // const textToTranslate = world.features.map(features => {
  //   const { NAME: name } = features.properties;
  //   let Text;
  //   if (!name || name === 'unclaimed') Text = '';
  //   else Text = name;
  //   return { Text };
  // });

  // world.features = world.features.map((features, index) => ({
  //   ...features,
  //   properties: {
  //     ...features.properties,
  //     translations: convertTranslationToKeyValueObject(
  //       translations[index].translations
  //     ),
  //   },
  // }));
  saveWorld(world, fileName);
});
