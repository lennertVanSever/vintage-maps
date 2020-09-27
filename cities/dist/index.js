"use strict";
const _global = (window /* browser */ || global /* node */);
_global.getAllCitiesUntilYear = (cities, givenYear) => {
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
        });
        feature.properties.populationAtGivenYear = feature.properties.populationByYear[closestYearToGivenYear];
        return feature;
    });
    return cities;
};


_global.getAllCitiesUntilYearThree = (cities, givenYear) => {
    cities = cities.filter(({ populationByYear }) => {
        const condition = givenYear >= Number(Object.keys(populationByYear)[0]);
        return condition;
    });
    cities = cities.map((city) => {
        let closestYearToGivenYear = -10000;
        Object.keys(city.populationByYear).forEach((yearString) => {
            const yearNumber = Number(yearString);
            if (Math.abs(yearNumber - givenYear) < Math.abs(closestYearToGivenYear - givenYear)) {
                closestYearToGivenYear = yearNumber;
            }
        });
        // city.size = city.populationByYear[closestYearToGivenYear] / 400000;
        city.sizeTest = city.populationByYear[closestYearToGivenYear] / 10000000;
        return city;
    });
    return cities;
};
//# sourceMappingURL=index.js.map