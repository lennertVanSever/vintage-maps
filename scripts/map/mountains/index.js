import * as d3 from 'd3';
import { mapRange } from '../utils.js';

/*
<?xml version="1.0" encoding="utf-8"?>
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1.5 1" style="enable-background:new 0 0 1.5 1;" xml:space="preserve">
	<path id="small_1" d="M1.1,0.7L1.1,0.7L0.8,0.5c-0.1-0.1-0.3-0.1-0.4,0L0,1h0.8h0.4h0.3L1.2,0.7C1.1,0.7,1.1,0.7,1.1,0.7z"/>
	<path id="small_2" d="M-1.1,0.6l-0.1,0.1l-0.1-0.1c-0.1-0.1-0.3-0.2-0.4,0L-1.9,1h0.5h0.5h0.5l-0.3-0.4C-0.9,0.5-1,0.5-1.1,0.6z"/>
	<path id="small_3" d="M-3.9,1h0.3h0.4h0.8l-0.3-0.4c-0.1-0.2-0.4-0.1-0.5,0l-0.1,0.2l-0.1-0.1c0-0.1-0.1-0.1-0.2,0L-3.9,1z"/>
	<path id="medium_1" d="M-5,0.7l-0.1,0.1c0,0,0,0,0,0l-0.4-0.5c0,0,0,0,0,0L-6.1,1c0,0,0,0,0,0h0.7h0.4h0.3c0,0,0,0,0,0L-5,0.7C-5,0.7-5,0.7-5,0.7z"/>
	<path id="medium_2" d="M-7,0.3l-0.2,0.4c0,0,0,0,0,0l-0.2-0.4c0,0,0,0,0,0L-8,1c0,0,0,0,0,0h0.5H-7h0.5c0,0,0,0,0,0L-7,0.3C-7,0.3-7,0.3-7,0.3z"/>
	<path id="medium_3" d="M-9.6,0.5L-9.9,1c0,0,0,0,0,0h0.3h0.4h0.7c0,0,0,0,0,0L-9,0.3c0,0,0,0,0,0l-0.3,0.5c0,0,0,0,0,0L-9.6,0.5C-9.6,0.5-9.6,0.5-9.6,0.5z"/>
	<path id="big_1" d="M-11.1,0.4l-0.1,0.2c0,0,0,0,0,0L-11.6,0c0,0,0,0,0,0l-0.6,1c0,0,0,0,0,0h0.7h0.4h0.3c0,0,0,0,0,0L-11.1,0.4C-11,0.4-11,0.4-11.1,0.4z"/>
	<path id="big_2_1_" d="M-13.2,0l-0.2,0.4c0,0,0,0,0,0L-13.7,0c0,0,0,0,0,0l-0.5,1c0,0,0,0,0,0h0.5h0.6h0.5c0,0,0,0,0,0L-13.2,0C-13.2,0-13.2,0-13.2,0z"/>
	<path id="big_3_1_" d="M-15.7,0.2L-16.1,1c0,0,0,0,0,0h0.3h0.4h0.7c0,0,0,0,0,0l-0.6-1c0,0,0,0,0,0l-0.3,0.6c0,0,0,0,0,0L-15.7,0.2C-15.7,0.2-15.7,0.2-15.7,0.2z"/>
</svg>
*/
export class Mountains {
  constructor(map) {
    this.map = map;
    this.paths = {
      BIG: [
        'M37.2,13.6L32.6,22c-0.1,0.2-0.4,0.2-0.5,0L19.9,0.1c-0.1-0.2-0.4-0.2-0.5,0L0,34.9c-0.1,0.2,0,0.4,0.2,0.4h24.8h14.5h9.8c0.2,0,0.3-0.2,0.2-0.4L37.7,13.6C37.6,13.4,37.4,13.4,37.2,13.6z',
        'M33.1-0.1l-9.9,17.7l0,0L16.6-0.1l0,0L0,35.4l0,0h16.6h16.6h16.6l0,0L33.1-0.1L33.1-0.1z',
        'M10.6,7.1L0,35.5l0,0h10.6h14.2h24.8l0,0L31.9,0l0,0L21.3,21.3l0,0L10.6,7.1C14.2,7.1,10.6,7.1,10.6,7.1z',
      ],
      MEDIUM: [
        'M37.4,23.2l-4.8,4.4c-0.1,0.1-0.3,0.1-0.4,0L20,9.8c-0.1-0.2-0.3-0.2-0.4,0l-19.4,25c-0.2,0.2,0,0.5,0.2,0.5h24.9h14.5h9.7c0.2,0,0.4-0.3,0.2-0.5L37.8,23.2C37.7,23.1,37.5,23.1,37.4,23.2z',
        'M32.5,10.4l-7.5,14.7c-0.1,0.2-0.4,0.2-0.5,0l-7.5-14.7c-0.1-0.2-0.3-0.2-0.5,0L0,34.9c-0.1,0.2,0,0.5,0.2,0.5h15.3h18.5h15.3c0.2,0,0.4-0.3,0.2-0.5L33,10.4C32.9,10.2,32.6,10.2,32.5,10.4z',
        'M11.9,18L0,35.1c-0.1,0.2,0,0.4,0.2,0.4h9.8h14.5h24.8c0.2,0,0.3-0.2,0.2-0.4L30.2,11.6c-0.1-0.2-0.4-0.2-0.5,0L18.9,29.3c-0.1,0.2-0.4,0.2-0.5,0l-6-11.3C12.3,17.8,12,17.8,11.9,18z',
      ],
      SMALL: [
        'M35.2,25l-3,2.8l-6.9-10c-2.9-4.2-8.7-4.4-11.8-0.3L-0.1,35.3h25.1h14.4h10.2L39.4,25.1C38.3,23.9,36.4,23.9,35.2,25z',
        'M27.3,20.7l-2.5,4.9l-2.4-4.7c-2.5-5-9.1-5.4-12.2-0.8L0.1,35.3h15.7H34h15.7L39.3,19.9C36.3,15.3,29.8,15.8,27.3,20.7z',
        'M-0.3,35.5H10h14.4h25.2L38,20.4C33.9,15,26,15.3,22.2,20.8l-5,7.3l-2.8-4.2c-1.4-2.1-4.3-2.2-5.9-0.1L-0.3,35.5z',
      ],
    };
  }

  async render() {
    await this.getData();
    this.draw();
  }

  async getData() {
    this.data = await d3.json(`./scripts/map/mountains/data.json`);
    // this.countryData = await d3.json(`maps/test.geojson`);
  }

  // changeProjection() {
  //   d3.selectAll('.river').attr('d', this.map.geoPath);
  //   d3.selectAll('.riverShadow').attr('d', this.map.geoPath);
  // }

  // resize(zoomFactor) {
  //   d3.selectAll('.river').attr('stroke-width', zoomFactor / 2);
  // }

  getProjectedCoordinates({ properties: { longitude, latitude } }) {
    return this.map.projection([longitude, latitude]);
  }

  draw() {
    this.map.subGroups.mountains
      .append('g')
      .attr('class', 'mountains')
      .selectAll('path')
      .data(this.data.features)
      .enter()
      .append('path')
      // .attr('d', ({ properties: { meters } }) => {
      //   const height = mapRange(meters, 500, 8848, 0.02, 0.7);
      //   // d3.symbol().type(d3.symbolTriangle).size(0.15)()
      //   return `M0,${-height}L0.29428309563827115,0.16990442448471224L-0.29428309563827115,0.16990442448471224Z`;
      // })
      .attr('d', ({ properties: { meters } }, index) => {
        const size = (() => {
          if (meters < 1500) {
            return 'SMALL';
          }
          if (meters < 3000) {
            return 'MEDIUM';
          }
          return 'BIG';
        })();
        return this.paths[size][index % 3];
      })
      .attr('transform', d => {
        const [x, y] = this.getProjectedCoordinates(d);
        // return `translate(${x}, ${y})`;
        return `translate(${x}, ${y}), scale(0.015)`;
      })
      .attr('fill', 'var(--mountains)');
    // .attr('fill', 'none')
    // .attr('stroke', 'var(--mountains)')
    // .attr('stroke-width', 5);
  }
}
