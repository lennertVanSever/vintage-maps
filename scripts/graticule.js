import colors from './colors.js';

export class Graticule {
  constructor(geoPath, group) {
    this.geoPath = geoPath;
    this.group = group;
    this.x = 180;
    this.y = 90;
  }

  render() {
    this.setGraticule();
    this.drawOutlineOfGraticule();
    this.drawGraticule();
  }

  setGraticule() {
    this.graticule = d3.geoGraticule().extent([
      [-this.x, -this.y],
      [this.x, this.y],
    ]);
  }

  drawGraticule() {
    this.group
      .append('path')
      .datum(this.graticule)
      .attr('class', 'graticule')
      .attr('d', this.geoPath)
      .attr('fill', 'none')
      .attr('stroke', colors.graticule)
      .attr('stroke-width', 0.2);
  }

  drawOutlineOfGraticule() {
    this.group
      .append('path')
      .datum(this.graticule.outline)
      .attr('class', 'graticule outline')
      .attr('d', this.geoPath)
      .attr('fill', colors.background)
      .attr('stroke', colors.graticule)
      .attr('stroke-width', 1);
  }
}
