import * as d3 from 'd3';
import { addParametersToURL } from '../../utils';
import { camalize, resetAlreadySelected } from '../utils.js';

export class SeaLabels {
  constructor(map) {
    this.map = map;
  }

  async render() {
    await this.getData();
    this.draw();
  }

  async getData() {
    this.data = await d3.json(`./scripts/map/seaLabels/data.geojson`);
    // this.countryData = await d3.json(`maps/test.geojson`);
  }

  changeProjection() {
    this.draw();
  }

  resize() {
    const svgRect = this.map.svg.node().getBoundingClientRect();
    const margin = 40;
    d3.selectAll('.seaLabelsText').style('display', 'block');
    d3.selectAll('.seaLabelsText').each(function () {
      const labelText = d3.select(this);
      const labelRect = labelText.node().getBoundingClientRect();
      if (
        labelRect.left - margin < svgRect.left ||
        labelRect.right + margin > svgRect.right ||
        labelRect.top - margin * 1.5 < svgRect.top ||
        labelRect.bottom + margin > svgRect.bottom
      ) {
        labelText.style('display', 'none');
      }
    });
  }

  updateLanguage() {
    d3.selectAll('.seaLabelTextPath').text(
      d => d.properties.translations[this.map.language]
    );
  }

  draw() {
    this.map.subGroups.seaLabels.selectAll('*').remove();
    this.map.subGroups.seaLabels
      .append('g')
      .attr('class', 'seaLabels')
      .selectAll('path')
      .data(this.data.features)
      .enter()
      .append('path')
      .attr('d', this.map.geoPath)
      .attr('class', 'seaLabel')
      .attr('fill', 'none')
      .attr('id', ({ properties: { id } }) => `seaLabelPath${id}`);
    // .attr('stroke-width', 1)
    // .attr('stroke', `black`);

    this.map.subGroups.seaLabels
      .append('g')
      .attr('class', 'seaLabelsPaths')
      .selectAll('textPath')
      .data(this.data.features)
      .enter()
      .append('text')
      .attr('fill', 'var(--country)')
      .attr('id', ({ properties: { id } }) => `seaLabelText${id}`)
      .attr('class', 'seaLabelsText')
      .style('text-anchor', 'middle')
      .attr('dy', '-0.5px')
      .attr('font-size', ({ properties: { size } }) => size * 7)
      .attr('letter-spacing', ({ properties: { spacing } }) => spacing * 7)
      .append('textPath')
      .attr('class', 'seaLabelTextPath')
      .attr('startOffset', '50%')
      .attr('xlink:href', ({ properties: { id } }) => `#seaLabelPath${id}`)
      .text(d => d.properties.translations[this.map.language]);
  }
}
