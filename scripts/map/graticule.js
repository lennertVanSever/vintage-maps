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
    this.setSpecialParallels();
    this.drawOutlineOfGraticule();
    this.drawGraticule();
    this.drawSpecialParallels();
  }

  setGraticule() {
    this.graticule = d3.geoGraticule().extent([
      [-this.x, -this.y],
      [this.x, this.y],
    ]);
  }

  setSpecialParallels() {
    const polarCircle = 66.3348;
    const tropicCircle = 23.4394;
    const equator = 0;

    this.specialParallels = [
      polarCircle,
      tropicCircle,
      equator,
      -tropicCircle,
      -polarCircle,
    ].map(latitudes => {
      latitudes += 0.1; // make small correction
      return d3.geoGraticule().extent([
        [-this.x, latitudes - 0.11],
        [this.x, latitudes],
      ]);
    });

    this.specialParallels.forEach(singleLine => {
      singleLine.step([0, 0.1]);
    });
  }

  resize(zoomFactor) {
    d3.selectAll('.graticule').attr('stroke-width', zoomFactor);
    d3.selectAll('.moveGraticule').attr(
      'transform',
      `translate(0,-${zoomFactor * 15})`
    );
  }

  onlyGetFirstLine(multiLineFunction) {
    const multiLine = multiLineFunction();
    return {
      ...multiLine,
      coordinates: [multiLine.coordinates[0]],
    };
  }

  drawSpecialParallels() {
    this.specialParallels.forEach(parallel => {
      ['', 'moveGraticule'].forEach(extraClasses => {
        this.group
          .append('path')
          .datum(this.onlyGetFirstLine(parallel))
          .attr('class', `graticule specialParallel ${extraClasses}`)
          .attr('d', this.geoPath)
          .attr('fill', 'none')
          .attr('stroke', colors.graticule)
          .attr('stroke-width', this.initialStrokeWidth);
      });
    });
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
