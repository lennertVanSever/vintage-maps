import projectionNames from '../config/projections.js';
import years from '../config/years.js';
import { Cities } from './cities/index.js';
import { Rivers } from './rivers/index.js';
import { Countries } from './countries.js';
import { Graticule } from './graticule.js';
import { addParameterToURL, initialUrl, mapRange } from './utils.js';

export class Map {
  constructor() {
    this.svg = d3
      .select('svg')
      .attr('viewBox', [0, 0, window.innerWidth, window.innerHeight]);
    this.svg.selectAll('*').remove();
    this.group = this.svg.append('g');
    this.setInitialSubGroups();

    this.year = initialUrl.searchParams.get('year') || years[0];
    this.minimumZoom = 1;
    this.maximumZoom = 40;
    this.zoomController = d3.zoom();
    this.projectionName =
      initialUrl.searchParams.get('projection') || projectionNames[0];
  }

  set year(newYear) {
    const previousYear = this.year;
    addParameterToURL('year', newYear);
    this._year = newYear;
    if (previousYear) {
      this.cities.render();
      this.countries.render({ yearChange: true });
    }
  }

  get year() {
    return this._year;
  }

  set projectionName(newProjectionName) {
    const previousProjection = this.projection;
    addParameterToURL('projection', newProjectionName);
    this._projectionName = newProjectionName;
    this.reset();
    if (previousProjection) this.countries.render();
  }

  get projectionName() {
    return this._projectionName;
  }

  setInitialSubGroups() {
    this.subGroups = {};
    [
      'countryBorders',
      'rivers',
      'graticuleCollection',
      'cities',
      'countryNames',
    ].forEach(groupName => {
      this.subGroups[groupName] = this.group.append('g').attr('id', groupName);
    });
  }

  async reset() {
    this.svg.selectAll('*').remove();
    this.group = this.svg.append('g');
    this.setInitialSubGroups();
    this.render();
  }

  async render() {
    if (this.projectionName) {
      const scale =
        window.innerWidth > window.innerHeight
          ? window.innerWidth / 6
          : window.innerHeight / 3;
      this.projection = d3[`geo${this.projectionName}`]()
        .scale(scale)
        .translate([window.innerWidth / 2, window.innerHeight / 2])
        .precision(0.1);
      this.geoPath = d3.geoPath().projection(this.projection);

      this.graticule = new Graticule(this);
      this.graticule.render();

      this.countries = new Countries(this);
      await this.countries.render({});

      this.cities = new Cities(this);
      await this.cities.render();

      this.rivers = new Rivers(this);
      await this.rivers.render();

      this.makeMapZoomable();
      this.rezoom({ force: true });
    }
  }

  zoomToCoordinate({ x, y, width, height, maintainSameScale }) {
    let sidepanelSpaceHorizontal = 200;
    let sidepanelSpaceVertical = 0;
    let scaleFactorHorizontal = 2;
    let scaleFactorVertical = 1.5;
    if (window.innerWidth < 600) {
      sidepanelSpaceVertical = -window.innerHeight * 0.3;
      sidepanelSpaceHorizontal = 0;
      scaleFactorVertical = 3;
      scaleFactorHorizontal = 1.5;
    }

    const scaleWidth = window.innerWidth / width / scaleFactorHorizontal;
    const scaleHeight = window.innerHeight / height / scaleFactorVertical;
    const scale = maintainSameScale
      ? this.previousZoomValue
        ? this.previousZoomValue
        : 40
      : width > height
      ? scaleWidth
      : scaleHeight;

    this.svg
      .transition()
      .duration(500)
      .call(
        this.zoomController.transform,
        d3.zoomIdentity
          .translate(
            window.innerWidth / 2 + sidepanelSpaceHorizontal,
            window.innerHeight / 2 + sidepanelSpaceVertical
          )
          .scale(scale)
          .translate(-x - width / 2, -y - height / 2)
      );
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
      let zoomFactor;
      if (zoom.value < 5) {
        zoomFactor = mapRange(zoom.value, 5, zoom.minimum, 0.1, 0.2);
      } else {
        zoomFactor = mapRange(
          zoom.value,
          zoom.maximum,
          zoom.minimum,
          0.02,
          0.1
        );
      }
      this.countries.resizeBorders(zoomFactor);
      this.cities.resize(zoomFactor);
      this.graticule.resize(zoomFactor);
      this.rivers.resize(zoomFactor);
    }
    this.previousZoomValue = zoom.value;
  }

  makeMapZoomable() {
    this.svg.call(
      this.zoomController
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
