import colors from '../colors.js';
import {
  addParametersToURL,
  camalize,
  resetAlreadySelected,
} from '../utils.js';

export class Rivers {
  constructor(map) {
    this.map = map;
  }

  async render() {
    await this.getRiverData();
    this.drawRivers();
  }

  async getRiverData() {
    this.riverData = await d3.json(`./scripts/map/rivers/data.geojson`);
    // this.countryData = await d3.json(`maps/test.geojson`);
  }

  changeProjection() {
    d3.selectAll('.river').attr('d', this.map.geoPath);
    d3.selectAll('.riverShadow').attr('d', this.map.geoPath);
  }

  resize(zoomFactor) {
    d3.selectAll('.river').attr('stroke-width', zoomFactor / 2);
  }

  riverClicked(selectedRiver) {
    d3.event.stopPropagation();
    resetAlreadySelected();
    const selectedRiverElement = d3.select(
      `#riverShadow${camalize(selectedRiver.properties.NAME)}`
    );
    selectedRiverElement
      .attr('stroke', colors.rivers)
      .attr('stroke-width', 0.2);
    addParametersToURL({
      info: selectedRiver.properties.NAME,
      type: 'river',
    });

    const { x, y, width, height } = selectedRiverElement.node().getBBox();
    this.map.zoomToCoordinate({ x, y, width, height });
  }

  drawRivers() {
    this.map.subGroups.rivers
      .append('g')
      .attr('class', 'rivers')
      .selectAll('path')
      .data(this.riverData.features)
      .enter()
      .append('path')
      .attr('d', this.map.geoPath)
      .attr('class', 'river')
      .attr('fill', 'none')
      .attr('stroke-width', 0.1)
      .attr('stroke', colors.rivers);

    this.map.subGroups.rivers
      .append('g')
      .attr('class', 'riverShadows')
      .selectAll('path')
      .data(this.riverData.features)
      .enter()
      .append('path')
      .attr('d', this.map.geoPath)
      .attr('class', 'riverShadow')
      .attr('id', river => `riverShadow${camalize(river.properties.NAME)}`)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', 'transparent')
      .style('cursor', 'pointer')
      .on('click', this.riverClicked.bind(this));
  }
}
