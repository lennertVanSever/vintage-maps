import * as d3 from 'd3';
import * as d3GeoProjection from 'd3-geo-projection';
import { projectionNames, years } from '../config';
import { initialUrl } from '../utils';
import { Cities } from './cities/index.js';
import { Rivers } from './rivers/index.js';
import { Countries } from './countries.js';
import { Graticule } from './graticule.js';
import {
  addParametersToURL,
  addParameterToURL,
  debounce,
  mapRange,
} from './utils.js';

export class Map {
  constructor() {
    this.svg = d3
      .select('svg')
      .attr('viewBox', [0, 0, window.innerWidth, window.innerHeight]);
    this.svg.selectAll('*').remove();
    this.group = this.svg.append('g');
    this.setInitialSubGroups();

    this.year = initialUrl.searchParams.get('year') || years[0];
    this.borderWidth = 10;
    this.minimumZoom = 1;
    this.maximumZoom = 40;
    this.citySize = 5;
    this.graticuleGapSize = 50;
    this.graticuleLineSize = 1;
    this.zoomController = d3.zoom();
    this.transform = {
      k: initialUrl.searchParams.get('k') || 1,
      x: initialUrl.searchParams.get('x') || 0,
      y: initialUrl.searchParams.get('y') || 0,
    };
    this.projectionName =
      initialUrl.searchParams.get('projection') || projectionNames[0];
    this.reset();

    this.bouncedSaveZoomInUrl = this.saveZoomInUrl();

    window.addEventListener('resize', this.windowResize.bind(this));
  }

  windowResize() {
    this.svg.attr('viewBox', [0, 0, window.innerWidth, window.innerHeight]);
  }

  set year(newYear) {
    const previousYear = this.year;
    addParameterToURL('year', newYear);
    this._year = newYear;
    if (previousYear) {
      this.cities.render({ rezoom: true });
      this.countries.render({ rezoom: true });
    }
  }

  get year() {
    return this._year;
  }

  set borderWidth(borderWidth) {
    this._borderWidth = borderWidth;
    if (this.zoomFactor) {
      this.countries.resizeBorders(this);
    }
  }

  get borderWidth() {
    return this._borderWidth;
  }

  set citySize(citySize) {
    this._citySize = citySize;
    if (this.zoomFactor) {
      this.cities.resize(this);
    }
  }

  get citySize() {
    return this._citySize;
  }

  set graticuleGapSize(graticuleGapSize) {
    this._graticuleGapSize = Number(graticuleGapSize);
    if (this.zoomFactor) {
      this.graticule.resize(this);
    }
  }

  get graticuleGapSize() {
    return this._graticuleGapSize;
  }

  set graticuleLineSize(graticuleLineSize) {
    this._graticuleLineSize = Number(graticuleLineSize);
    if (this.zoomFactor) {
      this.graticule.resize(this);
    }
  }

  get graticuleLineSize() {
    return this._graticuleLineSize;
  }

  set projectionName(newProjectionName) {
    const previousProjection = this.projection;
    addParameterToURL('projection', newProjectionName);
    this._projectionName = newProjectionName;
    const projectionFunctionName = `geo${this.projectionName}`;
    const projectionFunction =
      d3GeoProjection[projectionFunctionName] || d3[projectionFunctionName];

    const scale =
      window.innerWidth > window.innerHeight
        ? window.innerWidth / 6
        : window.innerHeight / 3;

    this.projection = projectionFunction()
      .scale(scale)
      .translate([window.innerWidth / 2, window.innerHeight / 2])
      .precision(0.1);

    this.geoPath = d3.geoPath().projection(this.projection);

    if (previousProjection) {
      // this.reset();
      this.graticule.changeProjection();
      this.rivers.changeProjection();
      this.cities.changeProjection();
      this.countries.changeProjection();
    }
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
      this.graticule = new Graticule(this);
      this.graticule.render();

      this.countries = new Countries(this);
      await this.countries.render({});

      this.cities = new Cities(this);
      await this.cities.render({});

      this.rivers = new Rivers(this);
      await this.rivers.render();

      this.initialZoom();
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

  initialZoom() {
    this.svg
      .transition()
      .duration(0)
      .call(
        this.zoomController.transform,
        d3.zoomIdentity
          .translate(this.transform.x, this.transform.y)
          .scale(this.transform.k)
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
      if (zoom.value < 5) {
        this.zoomFactor = mapRange(zoom.value, 5, zoom.minimum, 0.1, 0.2);
      } else {
        this.zoomFactor = mapRange(
          zoom.value,
          zoom.maximum,
          zoom.minimum,
          0.02,
          0.1
        );
      }
      this.countries.resizeBorders(this);
      this.cities.resize(this);
      this.graticule.resize(this);
      this.rivers.resize(this.zoomFactor);
    }
    this.previousZoomValue = zoom.value;
  }

  saveZoomInUrl() {
    return debounce(() => {
      addParametersToURL(this.transform);
    }, 1000);
  }

  makeMapZoomable() {
    this.svg.call(
      this.zoomController
        .scaleExtent([this.minimumZoom, this.maximumZoom])
        .on('zoom', event => {
          this.transform = event.transform;
          this.bouncedSaveZoomInUrl();
          this.rezoom();
        })
    );
  }

  showOrHideElements(show, elementClassName) {
    if (show) {
      d3.selectAll(elementClassName).attr('display', 'block');
    } else {
      d3.selectAll(elementClassName).attr('display', 'none');
    }
  }
}
