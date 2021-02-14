import * as d3 from 'd3';
import { defaultColors } from './colors.js';

export class Graticule {
  constructor(map) {
    this.map = map;
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

  changeProjection() {
    d3.selectAll('.graticule').attr('d', this.map.geoPath);
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

  resize(map) {
    const graticuleStep = map.zoomFactor * map.graticuleGapSize;
    this.graticule.step([graticuleStep, graticuleStep]);
    this.removeGraticule();
    this.drawGraticule();
    d3.selectAll('.graticule').attr(
      'stroke-width',
      map.zoomFactor * map.graticuleLineSize
    );
    d3.selectAll('.moveGraticule').attr(
      'transform',
      `translate(0,-${map.zoomFactor * 15})`
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
        this.map.subGroups.graticuleCollection
          .append('path')
          .datum(this.onlyGetFirstLine(parallel))
          .attr('class', `graticule specialParallel ${extraClasses}`)
          .attr('d', this.map.geoPath)
          .attr('fill', 'none')
          .attr('stroke', defaultColors.graticule)
          .attr('stroke-width', this.initialStrokeWidth);
      });
    });
  }

  removeGraticule() {
    this.map.subGroups.graticuleCollection
      .selectAll('.graticuleInside')
      .remove();
  }

  drawGraticule() {
    this.map.subGroups.graticuleCollection
      .append('path')
      .datum(this.graticule)
      .attr('class', 'graticule graticuleInside')
      .attr('d', this.map.geoPath)
      .attr('fill', 'none')
      .attr('stroke', defaultColors.graticule)
      .attr('stroke-width', this.initialStrokeWidth);
  }

  drawOutlineOfGraticule() {
    this.map.subGroups.graticuleCollection
      .append('path')
      .datum(this.graticule.outline)
      .attr('class', 'graticule outline')
      .attr('d', this.map.geoPath)
      .attr('fill', 'none')
      .attr('stroke', defaultColors.graticule)
      .attr('stroke-width', this.initialStrokeWidth);
  }
}
