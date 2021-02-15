import * as d3 from 'd3';
import { defaultColors } from './colors.js';
import {
  addParametersToURL,
  camalize,
  getCountryNameCamelCase,
  mapRange,
  resetAlreadySelected,
} from './utils.js';

export class Countries {
  constructor(map) {
    this.map = map;
  }

  async render({ rezoom }) {
    this.map.subGroups.countryBorders.selectAll('*').remove();
    this.map.subGroups.countryNames.selectAll('*').remove();
    await this.getCountryData();
    this.drawInsideBorders();
    this.drawOutsideBorders();
    this.drawNamesOfCountries();
    this.selectCountryNameIfInUrl();
    if (rezoom) this.map.rezoom(true);
  }

  async getCountryData() {
    let mapYear = this.map.year;
    if (Number(mapYear) < 0) {
      mapYear = `bc${Math.abs(mapYear)}`;
    }
    const mapName = `world_${mapYear}`;
    if (this.countryRawData && this.countryRawData.name === mapName) {
      this.countryData = this.countryRawData;
    } else {
      this.countryData = await d3.json(`maps/${mapName}.geojson`);
    }
    this.countryRawData = JSON.parse(JSON.stringify(this.countryData));
  }

  changeProjection() {
    this.render({ rezoom: true });
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

  resizeBorders(map) {
    d3.selectAll('.insideBorderDark').attr(
      'stroke-width',
      map.zoomFactor * map.borderWidth
    );
    d3.selectAll('.outsideBorder').attr(
      'stroke-width',
      (map.zoomFactor * map.borderWidth) / 5
    );
    d3.selectAll('.insideBorderLight').attr(
      'stroke-width',
      map.zoomFactor * map.borderWidth * 2
    );
  }

  selectCountryNameIfInUrl() {
    const newUrl = new URL(window.location.href);
    const info = newUrl.searchParams.get('info');
    if (info) {
      const selectedCountry = d3.select(`#countryName${camalize(info)}`);
      if (selectedCountry) selectedCountry.dispatch('click');
    }
  }

  getColorIndexValue(country) {
    return this.isUnclaimed(country)
      ? 'none'
      : `var(--border-${country.properties.BORDER_COLOR_INDEX})`;
  }

  drawInsideBorders() {
    const addInsideBorder = ({ pathClass, fill }) => {
      return this.map.subGroups.countryBorders
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
        .attr('fill', country =>
          fill ? this.getColorIndexValue(country) : 'var(--body-color)'
        )
        .attr(
          'class',
          country =>
            `${pathClass} ${pathClass}${getCountryNameCamelCase(country)}`
        )
        .attr('stroke-alignment', 'inner')
        .attr('stroke', country => this.getColorIndexValue(country));
    };

    addInsideBorder({ pathClass: 'insideBorderDark' }).attr('stroke-width', 0);
    addInsideBorder({ pathClass: 'insideBorderLight' })
      .attr('stroke-width', 0)
      .attr('opacity', 0.5);
    addInsideBorder({ pathClass: 'insideFill', fill: true })
      .attr('stroke', 'none')
      .attr('opacity', 0.15);

    this.map.subGroups.countryBorders
      .append('g')
      .attr('class', 'borderClips')
      .selectAll('path')
      .data(this.countryData.features)
      .enter()
      .append('clipPath')
      .attr('class', 'borderClip')
      .attr('id', (d, index) => {
        return this.getIdBorderClip(index);
      })
      .append('path')
      .attr('d', this.map.geoPath);
  }

  drawOutsideBorders() {
    this.map.subGroups.countryBorders
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
      .attr('stroke', defaultColors.outsideBorder);
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

  countryClicked(event, selectedCountry) {
    event.stopPropagation();
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
    this.map.subGroups.countryNames
      .append('g')
      .attr('class', 'names')
      .selectAll('text')
      .data(this.countryData.features)
      .enter()
      .append('text')
      .attr('d', this.map.geoPath)
      .attr('class', `countryName canOverlapElement`)
      .attr('id', country => `countryName${getCountryNameCamelCase(country)}`)
      .style('fill', defaultColors.text)
      .style('text-anchor', 'middle')
      .text(d => (this.isUnclaimed(d) ? '' : d.properties.NAME))
      .style('cursor', 'pointer')
      .on('click', this.countryClicked.bind(this));

    const { projection } = this.map;
    d3.selectAll('.countryName').each(function (country, index) {
      const { DISTANCE: distance, X, Y } = country.properties.LABEL_PLACEMENT;
      const projectedPoint = projection([X, Y]);

      // const labelPlacement = polylabel(longestCoordinates[0], 0.1, 0.1);
      d3.select(this)
        .attr('x', projectedPoint[0])
        .attr('y', projectedPoint[1])
        .style('font-size', d => {
          const unit = 'mm';
          const fontSize = distance / 24;
          let smallFactor = 1;
          const letterCount = d.properties.NAME ? d.properties.NAME.length : 0;

          if (fontSize < 2) smallFactor = 1.5;
          if (fontSize < 0.5) smallFactor = 3;
          if (fontSize < 0.2) smallFactor = 5;
          const letterCountFactor = mapRange(letterCount, 30, 4, 0.5, 1.2);
          const maxSize = 20;
          const calculatedSize = fontSize * smallFactor * letterCountFactor;
          if (calculatedSize > maxSize) {
            return `${maxSize}${unit}`;
          }
          return `${calculatedSize}${unit}`;
        });
    });
  }
}
