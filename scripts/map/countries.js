import colors from './colors.js';
import {
  addParametersToURL,
  camalize,
  getCountryNameCamelCase,
  mapRange,
  polylabel,
  resetAlreadySelected,
} from './utils.js';

export class Countries {
  constructor(map) {
    this.map = map;
  }

  async render() {
    await this.getCountryData();
    this.drawInsideBorders();
    this.drawOutsideBorders();
    this.drawNamesOfCountries();
    this.selectCountryNameIfInUrl();
  }

  async getCountryData() {
    let mapYear = this.map.year;
    if (mapYear < 0) {
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

  getIdBorderClip(index, prefix = 'border') {
    return `${prefix}${index}`;
  }

  resizeBorders(zoomFactor) {
    d3.selectAll('.insideBorderDark').attr('stroke-width', zoomFactor * 10);
    d3.selectAll('.outsideBorder').attr('stroke-width', zoomFactor * 2);
    d3.selectAll('.insideBorderLight').attr('stroke-width', zoomFactor * 20);
  }

  selectCountryNameIfInUrl() {
    const newUrl = new URL(window.location.href);
    const info = newUrl.searchParams.get('info');
    if (info) {
      const selectedCountry = d3.select(`#countryName${camalize(info)}`);
      if (selectedCountry) selectedCountry.dispatch('click');
    }
  }

  drawInsideBorders() {
    const addInsideBorder = ({ pathClass }) => {
      return this.map.group
        .append('g')
        .attr('class', 'borders')
        .selectAll('path')
        .data(this.countryData.features)
        .enter()
        .append('path')
        .attr('clip-path', (d, index) => {
          return `url(#${this.getIdBorderClip(index)})`;
        })
        .attr('d', this.map.geoPath)
        .attr('fill', 'none')
        .attr(
          'class',
          country =>
            `${pathClass} ${pathClass}${getCountryNameCamelCase(country)}`
        )
        .attr('stroke-alignment', 'inner')
        .attr('stroke', country => {
          return this.isUnclaimed(country)
            ? 'none'
            : colors.insideBorders[country.properties.BORDER_COLOR_INDEX];
        });
    };

    addInsideBorder({ pathClass: 'insideBorderDark' }).attr('stroke-width', 0);
    addInsideBorder({ pathClass: 'insideBorderLight' })
      .attr('stroke-width', 0)
      .attr('opacity', 0.5);

    this.map.group
      .append('g')
      .attr('class', 'borderClip')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('clipPath')
      .attr('id', (d, index) => {
        return this.getIdBorderClip(index);
      })
      .append('path')
      .attr('d', this.map.geoPath);
  }

  drawOutsideBorders() {
    this.map.group
      .append('g')
      .attr('class', 'states')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('path')
      .attr('d', this.map.geoPath)
      .attr('class', 'outsideBorder')
      .attr('fill', 'none')
      // .attr('fill', colors.background)
      .attr('stroke-width', 0)
      .attr('stroke', colors.outsideBorder);
  }

  fillSelectedCountry(selectedCountryInsideBorder) {
    resetAlreadySelected();
    selectedCountryInsideBorder.attr(
      'fill',
      selectedCountryInsideBorder.attr('stroke')
    );
  }

  zoomToSelectedCountry(selectedCountryInsideBorder) {
    const {
      x,
      y,
      width,
      height,
    } = selectedCountryInsideBorder.node().getBBox();
    this.map.zoomToCoordinate({ x, y, width, height });
  }

  countryClicked(selectedCountry) {
    d3.event.stopPropagation();
    const selectedCountryInsideBorder = d3.selectAll(
      `.insideBorderLight${getCountryNameCamelCase(selectedCountry)}`
    );

    addParametersToURL({
      info: selectedCountry.properties.NAME,
      type: 'country',
    });
    this.fillSelectedCountry(selectedCountryInsideBorder);
    this.zoomToSelectedCountry(selectedCountryInsideBorder);
  }

  drawNamesOfCountries() {
    this.map.group
      .append('g')
      .attr('class', 'names')
      .selectAll('text')
      .data(this.countryData.features)
      .enter()
      .append('text')
      .attr('d', this.map.geoPath)
      .attr('class', `countryName canOverlapElement`)
      .attr('id', country => `countryName${getCountryNameCamelCase(country)}`)
      .style('fill', colors.text)
      .style('text-anchor', 'middle')
      .text(d => (this.isUnclaimed(d) ? '' : d.properties.NAME))
      .style('cursor', 'pointer')
      .on('click', this.countryClicked.bind(this));

    const { projection } = this.map;
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
          const fontSize = labelPlacement.d / 3;
          let smallFactor = 1;
          const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;

          if (fontSize < 2) smallFactor = 1.5;
          if (fontSize < 0.5) smallFactor = 3;
          if (fontSize < 0.2) smallFactor = 5;
          const letterCountFactor = mapRange(letterCount, 30, 4, 0.7, 1.2);
          return fontSize * smallFactor * letterCountFactor;
        });
    });
  }
}
