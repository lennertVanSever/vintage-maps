const csv = require('csv-parser');
const fs = require('fs');

const results = [];

const output = {
  type: 'FeatureCollection',
  name: 'ancient_cities',
  features: [],
};

const replaceYearLabelingByRealNumbers = labeledYear => {
  return labeledYear.replace('AD_', '').replace('BC_', '-');
};

const getPopulationByYear = city => {
  const populationByYear = {};
  Object.keys(city).forEach(year => {
    const isYear = /(BC|AD)/.test(year);
    if (isYear && city[year]) {
      const yearAsNumber = replaceYearLabelingByRealNumbers(year);
      populationByYear[yearAsNumber] = Number(city[year]);
    }
  });
  return populationByYear;
};

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', data => results.push(data))
  .on('end', () => {
    console.log(results);
    output.features = results.map(city => {
      return {
        type: 'Feature',
        properties: {
          NAME: city.City,
          country: city.Country,
          otherNames: (() => {
            const otherNamesArray = city.OtherName.split(', ');
            return otherNamesArray[0] === '' ? null : otherNamesArray;
          })(),
          populationByYear: getPopulationByYear(city),
        },
        geometry: {
          type: 'Point',
          coordinates: [
            city.Longitude.replace('�', ''),
            city.Latitude.replace('�', ''),
          ],
        },
      };
    });
    try {
      const path = '../data.geojson';
      fs.writeFileSync(path, JSON.stringify(output, null, 1));
      console.log(`succesfully generated data at ${path}`);
    } catch (e) {
      console.error('something went wrong writing the file', e);
    }
  });
