/* eslint-disable max-classes-per-file */
import * as d3 from 'd3';
import { isLocalHost } from '../../utils';
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
    this.largestPopulation = 0;
    this.calculate();
  }

  calculate() {
    this.data.features = this.data.features.filter(
      this.hasPopulationAtGivenYear.bind(this)
    );
    this.data.features = this.data.features.map(
      this.modifyDynamicalyPropertiesOfCity.bind(this)
    );
    this.data.features.forEach(({ currentPopulation }) => {
      if (currentPopulation > this.largestPopulation) {
        this.largestPopulation = currentPopulation;
      }
    });
    this.data.features = this.data.features.map(feature => {
      let size = 'SMALL';
      if (this.largestPopulation / 10 < feature.currentPopulation) {
        size = 'LARGE';
      } else if (this.largestPopulation / 50 < feature.currentPopulation) {
        size = 'MEDIUM';
      }
      return { ...feature, size };
    });
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

const getExtremes = ({ x, y, width, height }, padding) => {
  const round = (number, type) => Math[type](number * 10) / 10;
  return {
    left: round(x, 'floor') - padding,
    right: round(x + width, 'ceil') + padding,
    top: round(y, 'floor') - padding,
    bottom: round(y + height, 'ceil') + padding,
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
    window.addEventListener('keyup', this.keyup.bind(this));
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

  calculateDy(alignment, textDistance) {
    if (alignment === 'LEFT' || alignment === 'RIGHT')
      return `${textDistance / 2}px`;
    if (alignment === 'DOWN') return `${textDistance * 2.5}px`;
    return `-${textDistance}px`;
  }

  calculateDx(alignment, textDistance) {
    if (alignment === 'LEFT') return `-${textDistance}px`;
    if (alignment === 'RIGHT') return `${textDistance}px`;
  }

  calculateTextAnchor(alignment, textAnchor) {
    if (textAnchor) return textAnchor;
    if (alignment === 'LEFT') return `end`;
    if (alignment === 'RIGHT') return `start`;
    return 'middle';
  }

  resize(map) {
    // d3.selectAll(circle).attr('stroke-width', newWidth)

    const fontSize = map.zoomFactor * map.citySize * 5;
    const pointRadius = map.zoomFactor * map.citySize;
    const pointRadiusInner = (map.zoomFactor * map.citySize) / 2.5;
    const pointStrokeWidth = (map.zoomFactor * map.citySize) / 2;
    const textDistance = map.zoomFactor * map.citySize * 2;

    // } else {
    //   fontSize = mapRange(value, maximum, minimum, 0.5, 3);
    //   textDistance = mapRange(value, maximum, minimum, 0.2, 1.1);
    //   pointRadius = mapRange(value, maximum, minimum, 0.1, 0.5);
    // }

    const citiesPath = d3.geoPath().projection(this.map.projection);
    // let showCities = {};
    const cities = [];

    d3.selectAll('.city').attr('opacity', 0);
    d3.selectAll('.cityName')
      .attr('font-size', `${fontSize}px`)
      .attr('text-distance', textDistance)
      .attr('dy', d => this.calculateDy(d.properties.alignment, textDistance))
      .attr('dx', d => this.calculateDx(d.properties.alignment, textDistance));
    d3.selectAll('.cityPath')
      .attr('d', citiesPath.pointRadius(pointRadius))
      .attr('stroke-width', pointStrokeWidth);

    d3.selectAll('.cityPathInner').attr(
      'd',
      citiesPath.pointRadius(pointRadiusInner)
    );

    d3.selectAll('.canOverlapElement').each(function (node, index) {
      const isCountry = !node.currentPopulation;
      cities.push({
        index,
        name: node.properties.NAME,
        currentPopulation: node.currentPopulation || Infinity,
        isCountry,
        ...getExtremes(d3.select(this).node().getBBox(), textDistance / 2),
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
    d3.selectAll('.city').attr('opacity', hideElement);
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

  updateLanguage() {
    d3.selectAll('.cityName').text(
      ({ properties: { translations } }) => translations[this.map.language]
    );
  }

  getPosition(cityPath) {
    const [x, y] = cityPath
      .attr('transform')
      .replace('translate(', '')
      .replace(')', '')
      .replace(' ', '')
      .split(',');
    return [Number(x), Number(y)];
  }

  async saveNewCityData() {
    if (isLocalHost) {
      const responseRaw = await fetch('http://localhost:9000/modify_cities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cities: this.cityData.data,
        }),
      });
      const response = await responseRaw.json();
      console.info(response);
    }
  }

  keyup(event) {
    if (this.selectedCityLabel) {
      let { alignment, textAnchor } = this.selectedCityData.properties;
      switch (event.code) {
        case 'KeyR':
          textAnchor = 'start';
          break;
        case 'KeyL':
          textAnchor = 'end';
          break;
        case 'KeyM':
          textAnchor = 'middle';
          break;
        case 'ArrowDown':
          alignment = 'DOWN';
          break;
        case 'ArrowUp':
          alignment = 'UP';
          break;
        case 'ArrowLeft':
          alignment = 'LEFT';
          break;
        case 'ArrowRight':
          alignment = 'RIGHT';
          break;
        default:
          break;
      }
      const textDistance = Number(this.selectedCityLabel.attr('text-distance'));
      this.selectedCityLabel
        .attr('dy', this.calculateDy(alignment, textDistance))
        .attr('dx', this.calculateDx(alignment, textDistance))
        .attr('text-anchor', () => {
          return this.calculateTextAnchor(alignment, textAnchor);
        });
      this.cityData.data.features = this.cityData.data.features.map(feature => {
        if (
          JSON.stringify(feature.properties) ===
          JSON.stringify(this.selectedCityData.properties)
        ) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              textAnchor,
              alignment,
            },
          };
        }
        return feature;
      });
      this.saveNewCityData();
    }
  }

  cityRightClick(event, city) {
    event.preventDefault();
    this.selectedCityLabel = d3.select(
      `#cityName${camalize(city.properties.NAME)}`
    );
    this.selectedCityData = city;
    this.selectedCityLabel.style('fill', 'var(--red)');
  }

  dragCityPath(event, city) {
    const cityPath = d3.select(`#cityPath${camalize(city.properties.NAME)}`);
    function dragged({ dx, dy }) {
      const [previousX, previousY] = this.getPosition(cityPath);
      const newX = previousX + dx;
      const newY = previousY + dy;
      cityPath.attr('transform', `translate(${newX}, ${newY})`);
    }

    function ended() {
      const [previousProjectedX, previousProjectedY] = this.map.projection(
        city.geometry.coordinates
      );
      const [newX, newY] = this.getPosition(cityPath);
      const newProjectedX = previousProjectedX + newX;
      const newProjectedY = previousProjectedY + newY;
      const [
        reverseProjectedX,
        reverseProjectedY,
      ] = this.map.projection.invert([newProjectedX, newProjectedY]);
      this.cityData.data.features = this.cityData.data.features.map(feature => {
        if (
          JSON.stringify(feature.properties) === JSON.stringify(city.properties)
        ) {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: [reverseProjectedX, reverseProjectedY],
            },
          };
        }
        return feature;
      });
      this.saveNewCityData();
    }

    event.on('drag', dragged.bind(this)).on('end', ended.bind(this));
  }

  async render({ rezoom }) {
    this.map.subGroups.cities.selectAll('*').remove();
    await this.fetchData();
    const rawCityData = { ...this.allCities };
    this.cityData = new ModifyCityData(rawCityData, this.map.year);
    const citiesGroup = this.map.subGroups.cities
      .append('g')
      .attr('class', 'cities')
      .selectAll('circle')
      .data(this.cityData.data.features)
      .enter();

    const citiesPath = d3.geoPath().projection(this.map.projection);

    citiesGroup
      .append('path')
      .attr('class', 'city cityPath')
      .attr('d', citiesPath.pointRadius(0.5))
      .style('fill', ({ size }) => {
        // return 'var(--cityLabel)';
        if (size === 'LARGE') return 'var(--cityLabel)';
        return 'none';
      })
      .attr('transform', 'translate(0, 0)')
      .call(d3.drag().on('start', this.dragCityPath.bind(this)))
      .attr('stroke-width', 0.2)
      .attr('stroke', 'var(--cityLabel)')
      .attr('id', city => `cityPath${camalize(city.properties.NAME)}`);

    citiesGroup
      .append('path')
      .attr('class', 'city cityPathInner')
      .attr('d', citiesPath.pointRadius(0.1))
      .style('fill', ({ size }) => {
        if (size === 'MEDIUM') return 'var(--cityLabel)';
        return 'none';
      })
      .attr('id', city => `cityPathInner${camalize(city.properties.NAME)}`);

    const { map } = this;
    citiesGroup
      .append('text')
      .attr('x', city => this.getProjectedCoordinates(city)[0])
      .attr('y', city => this.getProjectedCoordinates(city)[1])
      .text(
        ({ properties: { translations } }) => translations[this.map.language]
      )
      .attr('font-family', 'inherit')
      .attr('text-anchor', d => {
        return this.calculateTextAnchor(
          d.properties.alignment,
          d.properties.textAnchor
        );
      })
      .on('contextmenu', this.cityRightClick.bind(this))
      .attr('class', 'city cityName canOverlapElement')
      .attr('font-size', '2px')
      .style('fill', 'var(--cityLabel)')
      .attr('font-style', 'italic')
      .style('cursor', 'pointer')
      .attr('id', city => `cityName${camalize(city.properties.NAME)}`)
      .on('click', function (event, city) {
        resetAlreadySelected();
        const selectedCity = d3.select(this);
        selectedCity.attr('fill', 'var(--selectedCity)');
        d3.select(`#cityPath${camalize(city.properties.NAME)}`).attr(
          'fill',
          'var(--selectedCity)'
        );
        event.stopPropagation();
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
