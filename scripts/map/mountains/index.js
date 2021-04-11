import * as d3 from 'd3';
import { isLocalHost } from '../../utils';
import { camalize, getExtremes, isOverlapping } from '../utils.js';

export class Mountains {
  constructor(map) {
    this.map = map;
    this.minimumScale = 0.03;
    // this.minimumScale = 0.05;
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
    this.draw({ rezoom: false });
  }

  async getData() {
    this.data = await d3.json(`./scripts/map/mountains/data.json`);
    // this.data = await d3.json(`./scripts/map/mountains/dataTest.json`);
  }

  resize({ zoomFactor }) {
    const scale = zoomFactor / 5;
    if (this.minimumScale > scale) {
      d3.selectAll('.mountainPaths').attr('transform', `scale(${scale})`);
    } else {
      d3.selectAll('.mountainPaths').attr(
        'transform',
        `scale(${this.minimumScale})`
      );
    }
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

  async saveNewMountainData() {
    if (isLocalHost) {
      const responseRaw = await fetch(
        'http://localhost:9000/modify_mountains',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mountains: this.data,
          }),
        }
      );
      const response = await responseRaw.json();
      console.info(response);
    }
  }

  mountainRightClick(event, selectedMountain) {
    event.preventDefault();
    this.data.features = this.data.features.filter(mountain => {
      return JSON.stringify(mountain) !== JSON.stringify(selectedMountain);
    });
    d3.selectAll(`#${this.getId(selectedMountain)}`).remove();
    this.saveNewMountainData();
  }

  getId({ properties: { name } }) {
    return `mountainPath${camalize(name)}`;
  }

  changeProjection() {
    this.draw();
  }

  hideIfOverlapping() {
    setTimeout(() => {
      // to make it non blocking
      const mountains = this.data.features.map(mountain => {
        try {
          const d3Element = d3.select(`#${this.getId(mountain)}`);
          return {
            d3Element,
            extremes: getExtremes({
              x: Number(d3Element.attr('x')),
              y: Number(d3Element.attr('y')),
              width: 0,
              height: 0,
            }),
          };
        } catch (e) {
          return null;
        }
      });
      d3.selectAll('.canOverlapElement').each(function () {
        const extremesDominantElement = getExtremes(
          d3.select(this).node().getBBox(),
          2
        );
        mountains.forEach(mountain => {
          if (mountain) {
            if (isOverlapping(extremesDominantElement, mountain.extremes)) {
              mountain.d3Element.remove();
            }
          }
        });
      });
    }, 200);
  }

  draw({ rezoom }) {
    this.map.subGroups.mountains.selectAll('*').remove();
    this.map.subGroups.mountains
      .append('g')
      .attr('class', 'mountains')
      .selectAll('path')
      .data(this.data.features)
      .enter()
      .append('g')
      .attr('transform', d => {
        const [x, y] = this.getProjectedCoordinates(d);
        return `translate(${x}, ${y})`;
      })
      .append('path')
      .attr('class', 'mountainPaths')
      .on('click', (_, d) => {
        console.log(d);
      })
      .on('contextmenu', this.mountainRightClick.bind(this))
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
      .attr('x', d => {
        const [x] = this.getProjectedCoordinates(d);
        return x;
      })
      .attr('y', d => {
        const [, y] = this.getProjectedCoordinates(d);
        return y;
      })
      .attr('id', this.getId)
      .attr('transform', `scale(${this.minimumScale})`)
      .attr('fill', 'var(--mountains)');
    this.hideIfOverlapping();
    if (rezoom) this.map.rezoom(true);
  }
}
