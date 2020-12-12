import colors from './colors.js';
import { mapRange } from './utils.js';

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class Countries {
  constructor(geoPath, group, year) {
    this.geoPath = geoPath;
    this.group = group;
    this.year = year;
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

  resizeBorders({ zoom: { value, minimum, maximum }}) {
    const resizeBorder = ({ pathClass, maximumWidth, inBetweenMinimumWidth, minimumWidth }) => {
      const inBetween = 5;
      let newWidth;
      if (value < inBetween) {
        newWidth = mapRange(value, inBetween, minimum, inBetweenMinimumWidth, maximumWidth);
      } else {
        newWidth = mapRange(value, maximum, inBetween, minimumWidth, inBetweenMinimumWidth);
      }
      d3.selectAll(pathClass).attr('stroke-width', newWidth)

    };
    resizeBorder({
      pathClass: '.insideBorderDark',
      maximumWidth: 2.5,
      inBetweenMinimumWidth: 0.6,
      minimumWidth: 0.15,
    })

    resizeBorder({
      pathClass: '.outsideBorder',
      maximumWidth: 0.8,
      inBetweenMinimumWidth: 0.05,
      minimumWidth: 0.01,

    })

    resizeBorder({
      pathClass: '.insideBorderLight',
      maximumWidth: 4,
      inBetweenMinimumWidth: 1,
      minimumWidth: 0.3,
    })
  }

  drawInsideBorders() {
    console.log('draw border')

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
          : colors.insideBorders[getRandomInteger(0, colors.insideBorders.length)]
      );
    }

    addInsideBorder({ pathClass: 'insideBorderDark' }).attr('stroke-width', 0);
    addInsideBorder({ pathClass: 'insideBorderLight' }).attr('stroke-width', 0).attr('opacity', 0.5);

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
      .style('fill', colors.text)
      .style('font-size', d => {
        const bounds = this.geoPath.bounds(d);
        const widthCountry = bounds[1][0] - bounds[0][0];
        let fontSize = widthCountry / 9;

        const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;
        const letterCountRatio = mapRange(letterCount, 4, 20, 1.5, 0.7);
        fontSize *= letterCountRatio;

        const maximumFontSize = 15;
        return fontSize > maximumFontSize
          ? `${maximumFontSize}px`
          : `${fontSize}px`;
      })
      .style('text-anchor', 'middle')
      .attr('transform', d => {
        const centroid = this.geoPath.centroid(d);
        if (!isNaN(centroid[0])) {
          return `translate(${centroid})`;
        }
        return null
      })
      .text(d => (this.isUnclaimed(d) ? '' : d.properties.NAME));
  }
}
