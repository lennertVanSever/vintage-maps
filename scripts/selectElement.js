import { ShadowElement } from './shadowElement.js';
import years from './years.js';
import projections from './projections.js';
import { map } from './index.js';

class SelectElement extends ShadowElement {
  constructor() {
    super();
    this.shadowRoot.querySelector('select').addEventListener('change', this.change);
  }
  get htmlString () {
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
    `
  }
  get optionHtml() {
    return this.options.map((option) => 
      /* html */ `
        <option value=${option.value}>${option.label}</option>
      `
    )
  }
}

window.customElements.define('select-element', SelectElement);

class YearSelect extends SelectElement {
  constructor() {
    super();
  }
  get labelText() {
    return 'Select a year';
  }
  get options() {
    return years.map((year) => {
      let label = `AD ${year}`
      if (year < 0) {
        label = `${Math.abs(year)} BC`
      }
      return {
        label,
        value: year
      }
    });
  }
  change(event) {
    map.year = event.target.value;
  }
}

window.customElements.define('year-select', YearSelect);


class ProjectionSelect extends SelectElement {
  constructor() {
    super();
  }
  get labelText() {
    return 'Select a projection';
  }
  get options() {
    return projections.map((projection) => ({ label: projection, value: projection }));
  }
  change(event) {
    map.projectionName = event.target.value;
  }
}

window.customElements.define('projection-select', ProjectionSelect);
