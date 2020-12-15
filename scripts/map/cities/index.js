/* eslint-disable max-classes-per-file */

import { mapRange } from '../utils.js';

class ModifyCityData {
  constructor(data, givenYear) {
    this.data = data;
    this.givenYear = givenYear;
    this.maximumSizeOfCity = 2.3;
    this.calculate();
  }

  calculate() {
    this.data.features = this.data.features.filter(
      this.hasPopulationAtGivenYear.bind(this)
    );
    this.data.features = this.data.features.map(
      this.modifyDynamicalyPropertiesOfCity.bind(this)
    );
  }

  hasPopulationAtGivenYear({ properties: { name, populationByYear } }) {
    const firstRecordedYear = Number(Object.keys(populationByYear)[0]);
    if (this.givenYear >= firstRecordedYear) {
      if (this.givenYear > 0) {
        const lastRecordedPopulationYear = Number(
          Object.keys(populationByYear)[
            Object.keys(populationByYear).length - 1
          ]
        );
        if (name === 'Caen') {
          console.log(name, lastRecordedPopulationYear, this.givenYear);
        }
        if (
          lastRecordedPopulationYear - this.givenYear < 0 ||
          lastRecordedPopulationYear - this.givenYear > 100
        ) {
          return true;
        }
      }
      return true;
    }
    return false;
  }

  modifyDynamicalyPropertiesOfCity(city) {
    const closestYearToGivenYear = this.getClosestYearToGivenYear(city);
    city.currentPopulation =
      city.properties.populationByYear[closestYearToGivenYear];
    return city;
  }

  getClosestYearToGivenYear(city) {
    let closestYearToGivenYear = -10000;
    Object.keys(city.properties.populationByYear).forEach(yearString => {
      const yearNumber = Number(yearString);
      if (
        Math.abs(yearNumber - this.givenYear) <
        Math.abs(closestYearToGivenYear - this.givenYear)
      ) {
        closestYearToGivenYear = yearNumber;
      }
    });
    return closestYearToGivenYear;
  }
}

const getExtremes = ({ x, y, width, height }) => ({
  left: x - width / 2,
  right: x + width / 2,
  bottom: y - height / 2,
  top: y + height / 2,
});

const citiesOverlap = (city1, city2) => {
  let overlapLeft = false;
  let overlapRight = false;
  let overlapTop = false;
  let overlapBottom = false;
  if (city1.left > city2.left && city1.left < city2.right) {
    overlapLeft = true;
  }
  if (city2.left > city1.left && city2.left < city1.right) {
    overlapLeft = true;
  }
  if (city1.right < city2.right && city1.right > city2.left) {
    overlapRight = true;
  }
  if (city1.bottom > city2.bottom && city1.bottom < city2.top) {
    overlapBottom = true;
  }
  if (city1.top < city2.top && city1.top > city2.bottom) {
    overlapTop = true;
  }
  return (
    (overlapLeft && overlapBottom) ||
    (overlapLeft && overlapTop) ||
    (overlapRight && overlapBottom) ||
    (overlapRight && overlapTop)
  );
};

export class Cities {
  constructor(year, group, projection) {
    this.year = year;
    this.group = group;
    this.projection = projection;
  }

  async fetchData() {
    const response = await fetch('./scripts/map/cities/data.json');
    const responseJson = await response.json();
    return responseJson;
  }

  resize({ zoom: { value, minimum, maximum } }) {
    // d3.selectAll(circle).attr('stroke-width', newWidth)
    let fontSize;
    let pointRadius;
    let textDistance;

    if (value < 5) {
      fontSize = mapRange(value, 5, minimum, 3, 10);
      textDistance = mapRange(value, 5, minimum, 1.1, 3.5);
      pointRadius = mapRange(value, 5, minimum, 0.5, 2);
    } else {
      fontSize = mapRange(value, maximum, minimum, 0.5, 3);
      textDistance = mapRange(value, maximum, minimum, 0.2, 1.1);
      pointRadius = mapRange(value, maximum, minimum, 0.1, 0.5);
    }

    const citiesPath = d3.geoPath().projection(this.projection);
    citiesPath.pointRadius(pointRadius);
    // let showCities = {};
    const cities = [];

    d3.selectAll('.cityName')
      .attr('font-size', `${fontSize}px`)
      .attr('dy', `-${textDistance}px`)
      .attr('opacity', 0);
    d3.selectAll('.cityPath').attr('d', citiesPath).attr('opacity', 0);

    d3.selectAll('.cityName').each(function (node, index) {
      cities.push({
        index,
        name: node.properties.name,
        currentPopulation: node.currentPopulation,
        ...getExtremes(d3.select(this).node().getBBox()),
      });
    });
    cities.sort((a, b) => b.currentPopulation - a.currentPopulation);
    const hideCities = [];
    cities.forEach((city, index) => {
      // console.log(city);
      for (let j = index + 1; j < cities.length; j++) {
        const otherCity = cities[j];
        if (citiesOverlap(city, otherCity)) {
          hideCities.push(otherCity.name);
        }
      }
    });
    const hideElement = ({ properties: { name } }) =>
      hideCities.includes(name) ? 0 : 1;
    d3.selectAll('.cityName').attr('opacity', hideElement);
    d3.selectAll('.cityPath').attr('opacity', hideElement);
  }

  getProjectedCoordinates = ({
    properties: { name },
    geometry: { coordinates },
  }) => {
    if (
      isNaN(this.projection(coordinates)[0]) ||
      isNaN(this.projection(coordinates)[1])
    ) {
      // console.log(name);
    }
    return this.projection(coordinates);
  };

  async render() {
    const rawCityData = await this.fetchData();
    const cityData = new ModifyCityData(rawCityData, this.year);
    // console.log(cityData.data.features);

    const citiesGroup = this.group
      .append('g')
      .attr('class', 'cities')
      .selectAll('circle')
      .data(cityData.data.features)
      .enter();

    const citiesPath = d3.geoPath().projection(this.projection);
    citiesPath.pointRadius(0.5);

    citiesGroup
      .append('path')
      .attr('class', 'cityPath')
      .attr('d', citiesPath)
      .attr('fill', '#000');

    citiesGroup
      .append('text')
      .attr('x', city => this.getProjectedCoordinates(city)[0])
      .attr('y', city => this.getProjectedCoordinates(city)[1])
      .text(({ properties: { name } }) => name)
      .attr('font-family', 'sans-serif')
      .attr('alignment-baseline', 'baseline')
      .attr('text-anchor', 'middle')
      .attr('class', 'cityName')
      .attr('font-size', '2px')
      .attr('fill', city => city.properties.name);
  }
}
