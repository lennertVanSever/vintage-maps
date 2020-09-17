import { Countries } from './countries.js';
import { Graticule } from './graticule.js';
import years from '../years.js';
import projectionNames from '../projections.js';


export class Map {
  constructor() {
    this.svg = d3.select('svg');
    this.svg.selectAll("*").remove();
    this.group = this.svg.append('g');
    this.year = years[0];
    this.projectionName = projectionNames[0];
  }
  
  set year(newYear) {
    this._year = newYear;
    this.reset()
  }

  get year() {
    return this._year;
  }

  set projectionName(newProjectionName) {
    this._projectionName = newProjectionName;
    this.reset()
  }

  get projectionName() {
    return this._projectionName;
  }

  reset() {
    this.svg.selectAll("*").remove();
    this.group = this.svg.append('g');
    this.render();
    this.rezoom();
  }
  
  async render() {
    if (this.projectionName) {
      const projection = 
        d3[`geo${this.projectionName}`]()
        .scale(270)
        .translate([740, 480])
        .precision(0.1);
      this.geoPath = d3.geoPath().projection(projection);
    
      const countries = new Countries(
        this.geoPath,
        this.group,
        `../maps/${this.year}`
      );
      countries.render();
  
      const graticule = new Graticule(this.geoPath, this.group);
      graticule.render();
  
      this.makeMapZoomable();
    }
  }

  rezoom() {
    if (this.transform) {
      this.group.attr('transform', this.transform);
    }
  }

  makeMapZoomable() {
    this.svg.call(
      d3
        .zoom()
        .scaleExtent([1, 40])
        .on('zoom', () => {
          this.transform = d3.event.transform;
          this.group.attr('transform', d3.event.transform);
        })
    );
  }
}
