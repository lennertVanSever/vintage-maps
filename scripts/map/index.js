import * as d3 from 'd3';
import * as d3GeoProjection from 'd3-geo-projection';
import { addParametersToURL, addParameterToURL, initial } from '../utils';
import { Cities } from './cities/index.js';
import { Mountains } from './mountains/index.js';
import { Rivers } from './rivers/index.js';
import { Countries } from './countries.js';
import { Framework } from './framework.js';
import { Graticule } from './graticule.js';
import { debounce, mapRange } from './utils.js';

export class Map {
  constructor() {
    this.svg = d3.select('svg');
    this.svg.selectAll('*').remove();
    this.bleedCorrections = {
      '360mmx260mm': -120,
      '660mmx460mm': -70,
      '960mmx660mm': -50,
      '260mmx360mm': 50,
      '460mmx660mm': 25,
      '660mmx960mm': 15,
    };
    this.direction = initial.direction;
    this.setSvgDimension();

    this.mapContentGroup = this.svg.append('g');
    this.setInitialSubGroups();
    this.transform = initial.transform;
    this.year = initial.year;
    this.borderWidth = initial.borderWidth;
    this.minimumZoom = 0.2;
    this.maximumZoom = 40;
    this.citySize = initial.citySize;
    this.language = initial.language;
    this.graticuleGapSize = initial.graticuleGapSize;
    this.graticuleLineSize = initial.graticuleLineSize;
    this.zoomController = d3.zoom();
    this.projectionName = initial.projectionName;
    this.reset();

    this.bouncedSaveZoomInUrl = this.saveZoomInUrl();
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

  set language(newLanguage) {
    const previousLanguage = this.language;
    this._language = newLanguage;
    if (previousLanguage) {
      this.countries.updateLanguage();
      this.cities.updateLanguage();
    }
  }

  get language() {
    return this._language;
  }

  set direction(newDirection) {
    const previousDirection = this.direction;
    this._direction = newDirection;
    if (previousDirection) {
      this.setSvgDimension();
      this.framework.reset();
    }
  }

  get direction() {
    return this._direction;
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

    // console.log(scale, window.innerWidth / 2, window.innerHeight / 2);
    this.projection = projectionFunction().scale(300);

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

  get isExploreVersion() {
    return this.svg.attr('data-explore');
  }

  setInitialSubGroups() {
    this.subGroups = {};
    [
      'backgroundRectangle',
      'countryBorders',
      'rivers',
      'mountains',
      'graticuleCollection',
      'cities',
      'countryNames',
    ].forEach(groupName => {
      this.subGroups[groupName] = this.mapContentGroup
        .append('g')
        .attr('id', groupName);
    });
  }

  async reset() {
    this.svg.selectAll('*').remove();
    const superGroup = this.svg
      .append('g')
      .attr('clip-path', 'url(#mapContentClip)');

    this.mapContentGroup = superGroup.append('g');
    this.setInitialSubGroups();
    this.render();
  }

  async render() {
    if (this.projectionName) {
      this.renderBackgroundRectangle();

      this.framework = new Framework(this);
      this.framework.render();

      this.graticule = new Graticule(this);
      this.graticule.render();

      this.countries = new Countries(this);
      await this.countries.render({});

      this.cities = new Cities(this);
      await this.cities.render({});

      this.rivers = new Rivers(this);
      await this.rivers.render();

      this.mountains = new Mountains(this);
      await this.mountains.render();

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
      this.mapContentGroup.attr('transform', this.transform);
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

  renderBackgroundRectangle() {
    this.subGroups.backgroundRectangle
      .append('rect')
      .attr('x', -1000)
      .attr('y', -1000)
      .attr('id', 'backgroundRectangle')
      .attr('width', 10000)
      .attr('height', 10000)
      .attr('opacity', 'var(--oceanOpacity)')
      .attr('fill', 'var(--ocean)');
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

  addBleedCorrection(printSize) {
    this.setSvgDimension(this.bleedCorrections[printSize]);
    this.framework.reset();
  }

  setSvgDimension(bleedCorrection = 0) {
    const width = 1109;
    const height = (() => {
      if (this.direction === 'landscape') {
        return (width * 3) / 2;
      }
      return (width * 2) / 3;
    })();
    this.svgDimensions = [0, 0, height + bleedCorrection, width];
    this.svg.attr('viewBox', this.svgDimensions);
  }
}
