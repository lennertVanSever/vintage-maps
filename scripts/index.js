import { Countries } from './countries.js';
import { Graticule } from './graticule.js';

class Map {
  constructor() {
    this.svg = d3.select('svg');
    this.group = this.svg.append('g');
    this.countryDataUrl = '../maps/world_1715.geojson';
  }

  async render() {
    this.setGeoPath();

    const countries = new Countries(
      this.geoPath,
      this.group,
      this.countryDataUrl
    );
    countries.render();

    const graticule = new Graticule(this.geoPath, this.group);
    graticule.render();

    this.makeMapZoomable();
  }

  setGeoPath() {
    const projection = d3
      .geoKavrayskiy7()
      // d3.geoMollweide()
      .scale(300)
      .translate([830, 500])
      .precision(0.1);

    this.geoPath = d3.geoPath().projection(projection);
  }

  makeMapZoomable() {
    this.svg.call(
      d3
        .zoom()
        .scaleExtent([1, 40])
        .on('zoom', () => {
          this.group.attr('transform', d3.event.transform);
        })
    );
  }
}

const map = new Map();
map.render();
