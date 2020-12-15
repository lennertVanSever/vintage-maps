import colors from './colors.js';
import { mapRange, polylabel } from './utils.js';

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class Countries {
  constructor(geoPath, group, year, projection) {
    this.geoPath = geoPath;
    this.group = group;
    this.year = year;
    this.projection = projection;
  }

  async render() {
    await this.getCountryData();
    this.drawInsideBorders();
    this.drawOutsideBorders();
    this.drawNamesOfCountries();
  }

  async getCountryData() {
    let mapYear = this.year;
    if (this.year < 0) {
      mapYear = `bc${Math.abs(this.year)}`;
    }
    this.countryData = await d3.json(`maps/world_${mapYear}.geojson`);
    // this.countryData = await d3.json(`maps/test.geojson`);
  }

  isUnclaimed(d) {
    return (
      d.properties.ABBREVNAME === 'Antarctica' ||
      d.properties.NAME === null ||
      d.properties.NAME === 'unclaimed'
    );
  }

  getId(d, prefix = 'border') {
    if (this.isUnclaimed(d)) return '';
    return `${prefix}${d.properties.NAME.replace(/\s/g, '_')}`;
  }

  resizeBorders({ zoom: { value, minimum, maximum } }) {
    const resizeBorder = ({
      pathClass,
      maximumWidth,
      inBetweenMinimumWidth,
      minimumWidth,
    }) => {
      const inBetween = 5;
      let newWidth;
      if (value < inBetween) {
        newWidth = mapRange(
          value,
          inBetween,
          minimum,
          inBetweenMinimumWidth,
          maximumWidth
        );
      } else {
        newWidth = mapRange(
          value,
          maximum,
          inBetween,
          minimumWidth,
          inBetweenMinimumWidth
        );
      }
      d3.selectAll(pathClass).attr('stroke-width', newWidth);
    };
    resizeBorder({
      pathClass: '.insideBorderDark',
      maximumWidth: 2.5,
      inBetweenMinimumWidth: 0.6,
      minimumWidth: 0.15,
    });

    resizeBorder({
      pathClass: '.outsideBorder',
      maximumWidth: 0.8,
      inBetweenMinimumWidth: 0.05,
      minimumWidth: 0.01,
    });

    resizeBorder({
      pathClass: '.insideBorderLight',
      maximumWidth: 4,
      inBetweenMinimumWidth: 1,
      minimumWidth: 0.3,
    });
  }

  drawInsideBorders() {
    console.log('draw border');

    const addInsideBorder = ({ pathClass }) => {
      return this.group
        .append('g')
        .attr('class', 'borders')
        .selectAll('path')
        .data(this.countryData.features)
        .enter()
        .append('path')
        .attr('clip-path', d => {
          return `url(#${this.getId(d)})`;
        })
        .attr('d', this.geoPath)
        .attr('fill', 'none')
        .attr('class', pathClass)
        .attr('stroke-alignment', 'inner')

        .attr('stroke', d =>
          this.isUnclaimed(d)
            ? 'none'
            : colors.insideBorders[
                getRandomInteger(0, colors.insideBorders.length)
              ]
        );
    };

    addInsideBorder({ pathClass: 'insideBorderDark' }).attr('stroke-width', 0);
    addInsideBorder({ pathClass: 'insideBorderLight' })
      .attr('stroke-width', 0)
      .attr('opacity', 0.5);

    this.group
      .append('g')
      .attr('class', 'borderClip')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('clipPath')
      .attr('id', d => {
        return this.getId(d);
      })
      .append('path')
      .attr('d', this.geoPath);
  }

  drawOutsideBorders() {
    this.group
      .append('g')
      .attr('class', 'states')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('path')
      .attr('d', this.geoPath)
      .attr('class', 'outsideBorder')
      .attr('fill', 'none')
      // .attr('fill', colors.background)
      .attr('stroke-width', 0)
      .attr('stroke', colors.outsideBorder);
  }

  drawNamesOfCountries() {
    this.group
      .append('g')
      .attr('class', 'names')
      .selectAll('text')
      .data(this.countryData.features)
      .enter()
      .append('text')
      .attr('d', this.geoPath)
      .attr('class', 'countryName canOverlapElement')
      .style('fill', colors.text)
      .style('text-anchor', 'middle')
      .text(d => (this.isUnclaimed(d) ? '' : d.properties.NAME));
    const { projection, group } = this;
    d3.selectAll('.countryName').each(function (country) {
      let longestCoordinates = [[]];

      country.geometry.coordinates.forEach(coordinatesCollection => {
        if (coordinatesCollection[0].length > longestCoordinates[0].length)
          longestCoordinates = coordinatesCollection;
      });

      longestCoordinates[0] = longestCoordinates[0].map(coordinates => {
        return projection(coordinates);
      });
      const labelPlacement = polylabel(longestCoordinates, 1, false);
      d3.select(this)
        .attr('x', labelPlacement.x)
        .attr('y', labelPlacement.y)
        .style('font-size', d => {
          const fontSize = labelPlacement.d / 5;
          let smallFactor = 1;
          const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;

          if (fontSize < 2.5) smallFactor = 2;
          if (fontSize < 2) smallFactor = 3;
          if (fontSize < 0.5) smallFactor = 5;
          if (fontSize < 0.2) smallFactor = 10;
          const letterCountFactor = mapRange(letterCount, 30, 4, 0.7, 1.2);
          return fontSize * smallFactor * letterCountFactor;
        });
    });
  }
}
