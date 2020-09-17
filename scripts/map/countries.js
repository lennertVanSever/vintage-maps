import colors from './colors.js';

function mapRange(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class Countries {
  constructor(geoPath, group, countryDataUrl) {
    this.geoPath = geoPath;
    this.group = group;
    this.countryDataUrl = countryDataUrl;
  }

  async render() {
    await this.getCountryData();
    this.drawInsideBorders();
    this.drawOutsideBorders();
    this.drawNamesOfCountries();
  }

  async getCountryData() {
    this.countryData = await d3.json(this.countryDataUrl);
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

  drawInsideBorders() {

    const addInsideBorder = () => {
      return this.group
      .append('g')
      .attr('class', 'statesColors')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('path')
      .attr('clip-path', d => {
        return `url(#${this.getId(d)})`;
      })
      .attr('d', this.geoPath)
      .attr('fill', 'none')
      .attr('stroke-alignment', 'inner')
      
      .attr('stroke', d =>
        this.isUnclaimed(d)
          ? 'none'
          : colors.borders[getRandomInteger(0, colors.borders.length)]
      );
    }

    addInsideBorder().attr('stroke-width', 1);
    addInsideBorder().attr('stroke-width', 1.8).attr('opacity', 0.5);

    this.group
      .append('g')
      .attr('class', 'statesClips')
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
      .attr('fill', 'none')
      // .attr('fill', colors.background)
      .attr('stroke-width', 0.3)
      .attr('stroke', 'black');
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
