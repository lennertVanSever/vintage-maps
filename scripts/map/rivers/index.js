import colors from '../colors.js';
import { addParametersToURL, resetAlreadySelected } from '../utils.js';

export class Rivers {
  constructor(geoPath, group, projection) {
    this.geoPath = geoPath;
    this.group = group;
    this.projection = projection;
  }

  async render() {
    await this.getRiverData();
    this.drawRivers();
  }

  async getRiverData() {
    this.riverData = await d3.json(`./scripts/map/rivers/data.geojson`);
    // this.countryData = await d3.json(`maps/test.geojson`);
  }

  resize(zoomFactor) {
    d3.selectAll('.river').attr('stroke-width', zoomFactor / 2);
  }

  riverClicked(selectedRiver) {
    d3.event.stopPropagation();
    resetAlreadySelected();
    d3.select(this).attr('stroke', colors.rivers).attr('stroke-width', 0.2);
    addParametersToURL({
      info: selectedRiver.properties.NAME,
      type: 'river',
    });
  }

  drawRivers() {
    this.group
      .append('g')
      .attr('class', 'rivers')
      .selectAll('path')
      .data(this.riverData.features)
      .enter()
      .append('path')
      .attr('d', this.geoPath)
      .attr('class', 'river')
      .attr('fill', 'none')
      .attr('stroke-width', 0.1)
      .attr('stroke', colors.rivers);

    this.group
      .append('g')
      .attr('class', 'riverShadows')
      .selectAll('path')
      .data(this.riverData.features)
      .enter()
      .append('path')
      .attr('d', this.geoPath)
      .attr('class', 'riverShadow')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', 'transparent')
      .style('cursor', 'pointer')
      .on('click', this.riverClicked);
  }
}
