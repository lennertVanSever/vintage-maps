import colors from './colors.js';
import { mapRange } from './utils.js';

export class Graticule {
  constructor(geoPath, group) {
    this.geoPath = geoPath;
    this.group = group;
    this.x = 180;
    this.y = 90;
    this.initialStrokeWidth = 0.2;
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

  resize({ zoom: { value, minimum, maximum } }) {
    let strokeWidth;
    if (value < 5) {
      strokeWidth = mapRange(value, 5, minimum, 0.1, this.initialStrokeWidth);
    } else {
      strokeWidth = mapRange(value, maximum, minimum, 0.01, 0.1);
    }
    d3.selectAll('.graticule').attr('stroke-width', strokeWidth);
  }

  drawGraticule() {
    this.group
      .append('path')
      .datum(this.graticule)
      .attr('class', 'graticule')
      .attr('d', this.geoPath)
      .attr('fill', 'none')
      .attr('stroke', colors.graticule)
      .attr('stroke-width', this.initialStrokeWidth);
  }

  drawOutlineOfGraticule() {
    this.group
      .append('path')
      .datum(this.graticule.outline)
      .attr('class', 'graticule outline')
      .attr('d', this.geoPath)
      .attr('fill', 'none')
      .attr('stroke', colors.graticule)
      .attr('stroke-width', this.initialStrokeWidth);
  }
}
