import 'd3-drag';
import * as d3 from 'd3';
import { addParametersToURL, isLocalHost } from '../utils';
import { camalize, getCountryId } from './utils.js';

export class Countries {
  constructor(map) {
    this.map = map;
    this.fontSizeUnit = 'px';
    window.addEventListener('keyup', this.keyup.bind(this));
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
    this.mapName = `world_${mapYear}`;
    if (this.countryRawData && this.countryRawData.name === this.mapName) {
      this.countryData = this.countryRawData;
    } else {
      this.countryData = await d3.json(`maps/${this.mapName}.geojson`);
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

  get strokeWidth() {
    return {
      insideBorderDark: this.map.zoomFactor * this.map.borderWidth,
      outsideBorder: (this.map.zoomFactor * this.map.borderWidth) / 5,
      insideBorderLight: (this.map.zoomFactor * this.map.borderWidth) / 2,
    };
  }

  resizeBorders() {
    const { strokeWidth } = this;
    d3.selectAll('.insideBorderDark').attr(
      'stroke-width',
      strokeWidth.insideBorderDark
    );
    d3.selectAll('.outsideBorder').attr(
      'stroke-width',
      strokeWidth.outsideBorder
    );
    d3.selectAll('.insideBorderLight').attr(
      'stroke-width',
      strokeWidth.insideBorderLight
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
          fill ? this.getColorIndexValue(country) : 'var(--body)'
        )
        .attr(
          'class',
          country => `${pathClass} ${pathClass}${getCountryId(country)}`
        )
        .attr('stroke-alignment', 'inner')
        .attr('stroke', country => this.getColorIndexValue(country));
    };

    addInsideBorder({ pathClass: 'insideBorderDark' }).attr(
      'stroke-width',
      this.strokeWidth.insideBorderDark
    );
    addInsideBorder({ pathClass: 'insideBorderLight' })
      .attr('stroke-width', this.strokeWidth.insideBorderLight)
      .attr('opacity', 0.5);
    addInsideBorder({ pathClass: 'insideFill', fill: true })
      .attr('stroke', 'none')
      .attr('opacity', 'var(--countryOpacity)');

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
      .attr('stroke-width', this.strokeWidth.outsideBorder)
      .attr('stroke', 'var(--outsideBorder)');
  }

  fillSelectedCountry(selectedCountryInsideBorder) {
    // resetAlreadySelected();
    if (Number(selectedCountryInsideBorder.attr('selected')) === 1) {
      selectedCountryInsideBorder.attr('fill', 'none').attr('selected', 0);
    } else {
      selectedCountryInsideBorder
        .attr('fill', selectedCountryInsideBorder.attr('stroke'))
        .attr('selected', 1);
    }
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
      `.insideBorderLight${getCountryId(selectedCountry)}`
    );

    addParametersToURL({
      info: selectedCountry.properties.NAME,
      type: 'country',
    });
    this.fillSelectedCountry(selectedCountryInsideBorder);
    // this.zoomToSelectedCountry(selectedCountryInsideBorder);
  }

  getPosition(label) {
    return {
      x: Number(label.attr('x')),
      y: Number(label.attr('y')),
    };
  }

  updateLanguage() {
    d3.selectAll('.countryName').text(d =>
      this.isUnclaimed(d) ? '' : d.properties.translations[this.map.language]
    );
  }

  async updateCountry(newProperties) {
    if (isLocalHost) {
      const responseRaw = await fetch('http://localhost:9000/modify_country', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapName: this.mapName,
          countryName: newProperties.NAME,
          changeProperties: newProperties,
        }),
      });
      const response = await responseRaw.json();
      console.info(response);
      if (
        this.selectedCountryLabelData &&
        newProperties.NAME === this.selectedCountryLabelData.properties.NAME
      ) {
        this.selectedCountryLabelData.properties = newProperties;
      }
    }
  }

  dragCountryName(event, selectedCountry) {
    const label = d3.select(`#countryName${getCountryId(selectedCountry)}`);
    function dragged({ dx, dy }) {
      const { x: previousX, y: previousY } = this.getPosition(label);
      label.attr('x', previousX + dx).attr('y', previousY + dy);
    }

    function ended() {
      const { x, y } = this.getPosition(label);
      // console.log(this.map.projection.inverse(label.attr('y')));
      const [newX, newY] = this.map.projection.invert([x, y]);
      this.updateCountry({
        ...selectedCountry.properties,
        CUSTOM_LABEL_PLACEMENT: {
          ...this.getLabelPlacementProperty(selectedCountry),
          X: newX,
          Y: newY,
        },
      });
      label.classed('dragging', false);
    }

    event.on('drag', dragged.bind(this)).on('end', ended.bind(this));
  }

  keyup(event) {
    if (this.selectedCountryLabel) {
      const step = 0.2;
      let newFontSize = Number(
        this.selectedCountryLabel
          .style('font-size')
          .replace(this.fontSizeUnit, '')
      );
      if (event.code === 'ArrowDown') {
        newFontSize -= step;
      }
      if (event.code === 'ArrowUp') {
        newFontSize += step;
      }
      this.selectedCountryLabel.style(
        'font-size',
        `${newFontSize}${this.fontSizeUnit}`
      );

      this.updateCountry({
        ...this.selectedCountryLabelData.properties,
        CUSTOM_LABEL_PLACEMENT: {
          ...this.getLabelPlacementProperty(this.selectedCountryLabelData),
          FONT_SIZE: `${newFontSize}${this.fontSizeUnit}`,
        },
      });
    }

    // this.selectedCountryLabel;
  }

  getLabelPlacementProperty(country) {
    return (
      country.properties.CUSTOM_LABEL_PLACEMENT ||
      country.properties.LABEL_PLACEMENT
    );
  }

  countryRightClick(event, selectedCountry) {
    event.preventDefault();
    this.selectedCountryLabel = d3.select(
      `#countryName${getCountryId(selectedCountry)}`
    );
    this.selectedCountryLabelData = selectedCountry;
    this.selectedCountryLabel.style('fill', 'var(--red)');
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
      .attr('id', country => `countryName${getCountryId(country)}`)
      .style('fill', 'var(--countryLabel)')
      .style('text-anchor', 'middle')
      .text(d =>
        this.isUnclaimed(d) ? '' : d.properties.translations[this.map.language]
      )
      .style('cursor', 'pointer')
      .call(d3.drag().on('start', this.dragCountryName.bind(this)))
      .on('contextmenu', this.countryRightClick.bind(this))
      .on('click', this.countryClicked.bind(this));
    const { projection } = this.map;
    const { getLabelPlacementProperty } = this;
    d3.selectAll('.countryName').each(function (country) {
      const { FONT_SIZE: fontSize, X, Y } = getLabelPlacementProperty(country);
      const projectedPoint = projection([X, Y]);
      // const labelPlacement = polylabel(longestCoordinates[0], 0.1, 0.1);
      d3.select(this)
        .attr('x', projectedPoint[0])
        .attr('y', projectedPoint[1])
        .style('font-size', fontSize);
    });
  }
}
