function mapRange(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export class Countries {
  constructor(geoPath, group, countryDataUrl) {
    this.geoPath = geoPath;
    this.group = group;
    this.countryDataUrl = countryDataUrl;
  }

  async render() {
    await this.getCountryData();
    this.drawFillsOfCountries();
    this.drawNamesOfCountries();
  }

  async getCountryData() {
    this.countryData = await d3.json(this.countryDataUrl);
  }

  drawFillsOfCountries() {
    const colors = d3.scaleOrdinal(d3.schemePaired);

    this.group
      .append('g')
      .attr('class', 'states')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('path')
      .attr('d', this.geoPath)
      .attr('fill', d => {
        if (d.properties.ABBREVNAME === 'Antarctica') {
          return 'white';
        }
        if (d.properties.NAME === null || d.properties.NAME === 'unclaimed') {
          return 'grey';
        }
        return colors(d.properties.NAME);
        // return(colors[Math.floor(Math.random() * colors.length)])
      });
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
      .style('font-size', d => {
        const bounds = this.geoPath.bounds(d);
        const widthCountry = bounds[1][0] - bounds[0][0];
        let fontSize = widthCountry / 7;

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
        return `translate(${this.geoPath.centroid(d)})`;
      })
      .text(d => d.properties.NAME);
  }
}
