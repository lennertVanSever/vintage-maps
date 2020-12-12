import { mapRange } from '../utils.js';

class ModifyCityData {
  constructor(data, givenYear) {
    this.data = data;
    this.givenYear = givenYear;
    this.maximumSizeOfCity = 2.3;
    this.calculate();
  }

  calculate() {
    this.data.features = this.data.features.filter(this.hasPopulationAtGivenYear.bind(this));
    this.data.features = this.data.features.map(this.modifyDynamicalyPropertiesOfCity.bind(this));
  }

  hasPopulationAtGivenYear({ properties : { name, populationByYear } }) {
    const firstRecordedYear = Number(Object.keys(populationByYear)[0]);
    if(this.givenYear >= firstRecordedYear) {
      if (this.givenYear > 0) {
        const lastRecordedPopulationYear = Number(Object.keys(populationByYear)[Object.keys(populationByYear).length - 1]);
        if (name === 'Caen') {
          console.log(name, lastRecordedPopulationYear, this.givenYear)

        }
        if (lastRecordedPopulationYear - this.givenYear < 0 || lastRecordedPopulationYear - this.givenYear > 100) {
          return true;
        }
      }
      return true;
    }
    return false;
  }

  modifyDynamicalyPropertiesOfCity(city) {
    const closestYearToGivenYear = this.getClosestYearToGivenYear(city);
    this.setSizeOfCity(city, closestYearToGivenYear);
    return city;
  }

  getClosestYearToGivenYear(city) {
    let closestYearToGivenYear = -10000;
    Object.keys(city.properties.populationByYear).forEach((yearString) => {
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

  setSizeOfCity(city, closestYearToGivenYear) {
    city.size = city.properties.populationByYear[closestYearToGivenYear] / 10000000;
  }
}

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

  resize({ zoom: { value, minimum, maximum }}) {
    // d3.selectAll(circle).attr('stroke-width', newWidth)
    let fontSize;
    let pointRadius;
    let textDistance;
    let opacity = 0;
    if (value > 2) opacity = 1;

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
    
    d3.selectAll('.cityName').attr('font-size', `${fontSize}px`).attr("dy", `-${textDistance}px`).attr('opacity', opacity)
    d3.selectAll('.cityPath').attr("d", citiesPath).attr('opacity', opacity)
  }

  getProjectedCoordinates = ({ properties: { name }, geometry: { coordinates } }) => {
    if (isNaN(this.projection(coordinates)[0]) || isNaN(this.projection(coordinates)[1])) {
      // console.log(name);
    }
    return this.projection(coordinates);
  }

  async render() {
    const rawCityData = await this.fetchData();
    const cityData = new ModifyCityData(rawCityData, this.year);
    // console.log(cityData.data.features);
    
    const citiesGroup = this.group.append("g").attr("class", "cities")
    .selectAll("circle")
    .data(cityData.data.features)
    .enter();

    var citiesPath = d3.geoPath().projection(this.projection);
    citiesPath.pointRadius(0.5);

    citiesGroup.append("path")
          .attr("class", "cityPath")
          .attr("d", citiesPath)
          .attr("fill", "#000");

    citiesGroup.append('text')
        .attr("x", city => this.getProjectedCoordinates(city)[0])
        .attr("y", city => this.getProjectedCoordinates(city)[1])
        .text(({ properties: { name } }) => name)
        .attr("font-family", "sans-serif")
        .attr("alignment-baseline", "baseline")
        .attr("text-anchor", "middle")
        .attr("class", "cityName")
        .attr("font-size", '2px')
        .attr("fill", city => city.properties.name);

  }
}