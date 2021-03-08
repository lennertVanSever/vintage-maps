import * as d3 from 'd3';
import { initial } from '../utils';

export class Framework {
  constructor(map) {
    this.map = map;
    this.titleMargin = 20;
    window.addEventListener('updateMapTitle', this.updateTitle.bind(this));
  }

  updateTitle({ detail: { value } }) {
    d3.select('#frameworkTitle').text(value);
  }

  addBorder(margin, strokeWidth) {
    const [x, y, width, height] = this.map.svgDimensions;
    // frameworkGroup.append('text').text('map title');
    this.group
      .append('rect')
      .attr('x', x + margin)
      .attr('y', y + margin + this.titleMargin)
      .attr('width', width - margin * 2)
      .attr('height', height - margin * 2 - this.titleMargin)
      .attr('fill', 'none')
      .attr('stroke-width', strokeWidth)
      .attr('stroke', 'var(--black)');
    // .attrs({ x: 0, y: 0, width: 80, height: 80, stroke: 'var(--black)' });
  }

  addClipMaskingMapContent(margin) {
    const [x, y, width, height] = this.map.svgDimensions;
    this.group
      .append('clipPath')
      .attr('id', 'mapContentClip')
      .append('rect')
      .attr('x', x + margin)
      .attr('y', y + margin + this.titleMargin)
      .attr('width', width - margin * 2)
      .attr('height', height - margin * 2 - this.titleMargin);
  }

  addTitle() {
    const [, , width] = this.map.svgDimensions;
    this.group
      .append('text')
      .text(initial.title)
      .attr('x', width / 2)
      .attr('id', 'frameworkTitle')
      .attr('fill', 'var(--black)')
      .attr('font-size', 25)
      .attr('y', 28)
      .attr('text-anchor', 'middle');
  }

  render() {
    if (!this.map.isExploreVersion) {
      this.group = this.map.svg.append('g');
      this.addBorder(20, 5);
      this.addBorder(30, 2);
      this.addClipMaskingMapContent(30);
      this.addTitle();
    }
  }

  reset() {
    this.group.selectAll('*').remove();
    this.render();
  }
}
