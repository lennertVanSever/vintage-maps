import projectionNames from '../projections.js';
import years from '../years.js';
import { Cities } from './cities/index.js';
import { Countries } from './countries.js';
import { Graticule } from './graticule.js';

export class Map {
  constructor() {
    this.svg = d3.select('svg');
    this.svg.selectAll('*').remove();
    this.group = this.svg.append('g');
    this.year = localStorage.getItem('year') || years[0];
    this.minimumZoom = 1;
    this.maximumZoom = 40;
    this.projectionName = projectionNames[0];
  }

  set year(newYear) {
    localStorage.setItem('year', newYear);
    this._year = newYear;
    this.reset();
  }

  get year() {
    return this._year;
  }

  set projectionName(newProjectionName) {
    this._projectionName = newProjectionName;
    this.reset();
  }

  get projectionName() {
    return this._projectionName;
  }

  async reset() {
    this.svg.selectAll('*').remove();
    this.group = this.svg.append('g');
    this.render();
  }

  async render() {
    if (this.projectionName) {
      const projection = d3[`geo${this.projectionName}`]()
        .scale(270)
        .translate([740, 480])
        .precision(0.1);
      this.geoPath = d3.geoPath().projection(projection);

      this.countries = new Countries(
        this.geoPath,
        this.group,
        this.year,
        projection
      );
      await this.countries.render();

      this.cities = new Cities(this.year, this.group, projection);
      await this.cities.render();

      const graticule = new Graticule(this.geoPath, this.group);
      graticule.render();

      this.makeMapZoomable();
      this.rezoom({ force: true });
    }
  }

  rezoom(force) {
    let zoom = {
      value: this.minimumZoom,
      minimum: this.minimumZoom,
      maximum: this.maximumZoom,
    };
    if (this.transform) {
      zoom = {
        value: this.transform.k,
        minimum: this.minimumZoom,
        maximum: this.maximumZoom,
      };
      this.group.attr('transform', this.transform);
    }
    if (this.previousZoomValue !== zoom.value || force) {
      this.countries.resizeBorders({ zoom });
      this.cities.resize({ zoom });
    }
    this.previousZoomValue = zoom.value;
  }

  makeMapZoomable() {
    this.svg.call(
      d3
        .zoom()
        .scaleExtent([this.minimumZoom, this.maximumZoom])
        // .wheelDelta(() => {
        //   return -event.deltaY * (event.deltaMode === 1 ? 0.5 : event.deltaMode ? 1 : 0.02);
        // })
        .on('zoom', () => {
          this.transform = d3.event.transform;
          this.rezoom();
        })
    );
  }
}
