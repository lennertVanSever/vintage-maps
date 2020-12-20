/* eslint-disable max-classes-per-file */

import projections from '../config/projections.js';
import years from '../config/years.js';
import { map } from '../index.js';
import { initialUrl } from '../map/utils.js';
import { ShadowElement } from './shadowElement.js';

export const ids = {
  YEAR_SELECT: 'yearSelect',
  PROJECTION_SELECT: 'projectionSelect',
};

class SelectElement extends ShadowElement {
  constructor() {
    super();
    this.shadowRoot
      .querySelector('select')
      .addEventListener('change', this.change);
  }

  get htmlString() {
    return /* html */ `
      <style>
        label {
          display: block;
          margin-top: var(--margin-4);
          margin-left: var(--margin-4);
        }
        select {
          display: block;
          margin-top: var(--margin-2);
        }
      </style>
      <label>
        ${this.labelText}
        <select>
          ${this.optionHtml}
        </select>
      </label>
    `;
  }

  get optionHtml() {
    return this.options.map(
      option => /* html */ `
        <option ${this.value === option.value ? 'selected' : ''} value=${
        option.value
      }>${option.label}</option>
      `
    );
  }
}

window.customElements.define('select-element', SelectElement);

export class YearSelect extends SelectElement {
  get labelText() {
    return 'Select a year';
  }

  get options() {
    return years.map(year => {
      let label = `AD ${year}`;
      if (year < 0) {
        label = `${Math.abs(year)} BC`;
      }
      return {
        label,
        value: year,
      };
    });
  }

  get value() {
    return initialUrl.searchParams.get('year');
  }

  change(event) {
    map.year = event.target.value;
  }
}

window.customElements.define('year-select', YearSelect);

class ProjectionSelect extends SelectElement {
  get labelText() {
    return 'Select a projection';
  }

  get id() {
    return ids.PROJECTION_SELECT;
  }

  get options() {
    return projections.map(projection => ({
      label: projection,
      value: projection,
    }));
  }

  get value() {
    return initialUrl.searchParams.get('projection');
  }

  change(event) {
    map.projectionName = event.target.value;
  }
}

window.customElements.define('projection-select', ProjectionSelect);
