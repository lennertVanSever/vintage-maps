require('.');
const realData = require('../data.json');

const mockedCities = {
  "type": "FeatureCollection",
  "name": "ancient_cities",
  "features": [
   {
    "type": "Feature",
    "properties": {
     "name": "A Coruna",
     "country": "Spain",
     "otherNames": [
      "Coruna",
      "A Coru�a"
     ],
     "populationByYear": {
      "1900": 43000
     }
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      "-8.41154",
      "43.362344"
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "name": "Aachen",
     "country": "Germany",
     "otherNames": [
      "Aix-la-Chapelle"
     ],
     "populationByYear": {
      "1300": 21000,
      "1500": 18000,
      "1600": 16000,
      "1700": 15000,
      "1750": 19000,
      "1799": 23699,
      "1800": 23000,
      "1849": 50533,
      "1850": 49000,
      "1851": 48688,
      "1900": 135000
     }
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      "6.08342",
      "50.77664"
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "name": "Aalborg",
     "country": "Denmark",
     "otherNames": null,
     "populationByYear": {
      "1900": 34000
     }
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      "9.9187",
      "57.048"
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "name": "Aarhus",
     "country": "Denmark",
     "otherNames": null,
     "populationByYear": {
      "1900": 51000
     }
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      "10.203921",
      "56.162939"
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "name": "Abeokuta",
     "country": "Nigeria",
     "otherNames": null,
     "populationByYear": {
      "1843": 50000,
      "1850": 60000,
      "1851": 60000,
      "1900": 60000
     }
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      "3.35",
      "7.15"
     ]
    }
   }
  ]
}

describe('getAllCitiesUntilYear', () => {
  it('should only give back the cities until a given year', () => {
    const givenYear = 2020;
    expect(window.getAllCitiesUntilYear(mockedCities, givenYear).features.every(city => {
      // console.log(city.properties);
      return Number(Object.keys(city.properties.populationByYear)[0]) <= givenYear;
    })).toBe(true)
    console.log(window.getAllCitiesUntilYear(realData, -1000));
  })

  it('should give the population size at the given time', () => {
    const givenYear = 2020;
    expect(window.getAllCitiesUntilYear(mockedCities, givenYear).features.every(city => {
      return city.properties.populationAtGivenYear === city.properties.populationByYear[1900];
    })).toBe(true)
  })
})