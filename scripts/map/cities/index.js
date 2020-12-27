/* eslint-disable max-classes-per-file */
import colors from '../colors.js';
import {
  addParametersToURL,
  camalize,
  resetAlreadySelected,
} from '../utils.js';

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

const getExtremes = ({ x, y, width, height }) => {
  const round = (number, type) => Math[type](number * 10) / 10;
  return {
    left: round(x, 'floor'),
    right: round(x + width, 'ceil'),
    top: round(y, 'floor'),
    bottom: round(y + height, 'ceil'),
  };
};

const citiesOverlap = (city1, city2) => {
  // todo: make a unit test here to optimize function
  let overlapLeft = false;
  let overlapRight = false;
  let overlapTop = false;
  let overlapBottom = false;
  if (city1.left >= city2.left && city1.left <= city2.right) {
    overlapLeft = true;
  }
  if (city2.left >= city1.left && city2.left <= city1.right) {
    overlapLeft = true;
  }
  if (city1.right <= city2.right && city1.right >= city2.left) {
    overlapRight = true;
  }
  // // console.log(city2, city1);
  if (city2.left >= city1.left && city2.left <= city1.right) {
    // revisit this part later, can be optimized
    overlapRight = true;
    overlapLeft = true;
  }

  if (city1.top <= city2.top && city1.bottom >= city2.bottom) {
    overlapTop = true;
    overlapBottom = true;
  }

  if (
    city1.top >= city2.top &&
    city1.top <= city2.bottom &&
    city1.bottom >= city2.bottom
  ) {
    overlapTop = true;
  }

  if (
    city1.bottom >= city2.top &&
    city1.top <= city2.top &&
    city1.bottom <= city2.bottom
  ) {
    overlapBottom = true;
  }

  return (
    (overlapLeft && overlapBottom) ||
    (overlapLeft && overlapTop) ||
    (overlapRight && overlapBottom) ||
    (overlapRight && overlapTop)
  );
};

export class Cities {
  constructor(map) {
    this.map = map;
  }

  async fetchData() {
    if (this.allCities) return this.allCities;
    const response = await fetch('./scripts/map/cities/data.json');
    // const response = await fetch('./scripts/map/cities/dataTest.json');
    this.allCities = await response.json();
    return this.allCities;
  }

  changeProjection() {
    this.render({ rezoom: true });
  }

  resize(zoomFactor) {
    // d3.selectAll(circle).attr('stroke-width', newWidth)
    const fontSize = zoomFactor * 25;
    const pointRadius = zoomFactor * 5;
    const textDistance = zoomFactor * 10;

    // } else {
    //   fontSize = mapRange(value, maximum, minimum, 0.5, 3);
    //   textDistance = mapRange(value, maximum, minimum, 0.2, 1.1);
    //   pointRadius = mapRange(value, maximum, minimum, 0.1, 0.5);
    // }

    const citiesPath = d3.geoPath().projection(this.map.projection);
    citiesPath.pointRadius(pointRadius);
    // let showCities = {};
    const cities = [];

    d3.selectAll('.cityName')
      .attr('font-size', `${fontSize}px`)
      .attr('dy', `-${textDistance}px`)
      .attr('opacity', 0);
    d3.selectAll('.cityPath').attr('d', citiesPath).attr('opacity', 0);

    d3.selectAll('.canOverlapElement').each(function (node, index) {
      const isCountry = !node.currentPopulation;
      cities.push({
        index,
        name: node.properties.NAME,
        currentPopulation: node.currentPopulation || Infinity,
        isCountry,
        ...getExtremes(d3.select(this).node().getBBox()),
      });
    });
    cities.sort((a, b) => b.currentPopulation - a.currentPopulation);
    const hideCities = [];
    cities.forEach((city, index) => {
      for (let j = index + 1; j < cities.length; j++) {
        const otherCity = cities[j];
        if (!otherCity.isCountry) {
          if (citiesOverlap(city, otherCity)) {
            hideCities.push(otherCity.name);
          }
        }
      }
    });

    const hideElement = ({ properties: { NAME } }) =>
      hideCities.includes(NAME) ? 0 : 1;

    d3.selectAll('.canOverlapElement')
      .attr('pointer-events', ({ properties: { NAME } }) =>
        hideCities.includes(NAME) ? 'none' : 'auto'
      )
      .attr('opacity', hideElement);
    d3.selectAll('.cityPath').attr('opacity', hideElement);
  }

  getProjectedCoordinates = ({
    properties: { name },
    geometry: { coordinates },
  }) => {
    if (
      isNaN(this.map.projection(coordinates)[0]) ||
      isNaN(this.map.projection(coordinates)[1])
    ) {
      // console.log(name);
    }
    return this.map.projection(coordinates);
  };

  selectCityNameIfInUrl() {
    const newUrl = new URL(window.location.href);
    const info = newUrl.searchParams.get('info');
    if (info) {
      const selectedCity = d3.select(`#cityName${camalize(info)}`);
      if (selectedCity) selectedCity.dispatch('click');
    }
  }

  async render({ rezoom }) {
    this.map.subGroups.cities.selectAll('*').remove();
    await this.fetchData();
    const rawCityData = { ...this.allCities };
    const cityData = new ModifyCityData(rawCityData, this.map.year);
    // console.log(cityData.data.features);

    const citiesGroup = this.map.subGroups.cities
      .append('g')
      .attr('class', 'cities')
      .selectAll('circle')
      .data(cityData.data.features)
      .enter();

    const citiesPath = d3.geoPath().projection(this.map.projection);
    citiesPath.pointRadius(0.5);

    citiesGroup
      .append('path')
      .attr('class', 'cityPath')
      .attr('d', citiesPath)
      .attr('fill', colors.text)
      .attr('id', city => `cityPath${camalize(city.properties.NAME)}`);

    const { map } = this;
    citiesGroup
      .append('text')
      .attr('x', city => this.getProjectedCoordinates(city)[0])
      .attr('y', city => this.getProjectedCoordinates(city)[1])
      .text(({ properties: { NAME } }) => NAME)
      .attr('font-family', 'sans-serif')
      .attr('alignment-baseline', 'baseline')
      .attr('text-anchor', 'middle')
      .attr('class', 'cityName canOverlapElement')
      .attr('font-size', '2px')
      .style('cursor', 'pointer')
      .attr('fill', colors.text)
      .attr('id', city => `cityName${camalize(city.properties.NAME)}`)
      .on('click', function (city) {
        resetAlreadySelected();
        const selectedCity = d3.select(this);
        selectedCity.attr('fill', colors.selectedCity);
        d3.select(`#cityPath${camalize(city.properties.NAME)}`).attr(
          'fill',
          colors.selectedCity
        );
        d3.event.stopPropagation();
        addParametersToURL({
          info: city.properties.NAME,
          type: 'city',
        });

        const { x, y, width, height } = selectedCity.node().getBBox();
        map.zoomToCoordinate({ x, y, width, height, maintainSameScale: true });
      });
    this.selectCityNameIfInUrl();
    if (rezoom) this.map.rezoom(true);
  }
}
