import { FeatureCollection } from "geojson";

declare global {
  function getAllCitiesUntilYear<FeatureCollection>(cities: FeatureCollection, givenYear: number) : FeatureCollection;
}

const _global = (window /* browser */ || global /* node */) as any

_global.getAllCitiesUntilYear = (cities: FeatureCollection, givenYear: number) => {
  cities.features = cities.features.filter(feature => {
    const condition = givenYear >= Number(Object.keys(feature.properties.populationByYear)[0]);
    return condition;
  });
  cities.features = cities.features.map((feature) => {
    let closestYearToGivenYear = -10000;
    Object.keys(feature.properties.populationByYear).forEach((yearString) => {
      const yearNumber = Number(yearString);
      if (Math.abs(yearNumber - givenYear) < Math.abs(closestYearToGivenYear - givenYear)) {
        closestYearToGivenYear = yearNumber;
      }
    })
    feature.properties.populationAtGivenYear = feature.properties.populationByYear[closestYearToGivenYear];
    return feature;
  })
  return cities;
}