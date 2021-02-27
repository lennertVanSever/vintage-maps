/* eslint-disable max-classes-per-file */

import { countries, fonts, languages, projectionNames, years } from '../config';
import { map } from '../index.js';
import { dispatchCustomEvent, initialUrl } from '../utils';
import { ShadowElement } from './shadowElement.js';
import { formElementStyle, labelStyle } from './sharedStyle.js';

export const ids = {
  YEAR_SELECT: 'yearSelect',
  PROJECTION_SELECT: 'projectionSelect',
  COUNTRY_SELECT: 'countrySelect',
  LANGUAGE_SELECT: 'languageSelect',
  FONT_SELECT: 'fontSelect',
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
        ${labelStyle}
        select {
          ${formElementStyle}
          background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position-x: calc(100% - var(--margin-2));
          background-position-y: var(--margin-2);
        }
      </style>

      <label>
        ${this.labelText}
        <select name=${this.name}>
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
    return 'Year';
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
    return 'Projection';
  }

  get id() {
    return ids.PROJECTION_SELECT;
  }

  get options() {
    return projectionNames.map(projection => ({
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

class CountrySelect extends SelectElement {
  get labelText() {
    return 'Country';
  }

  get id() {
    return ids.COUNTRY_SELECT;
  }

  get options() {
    return countries.map(({ name: label, code: value }) => ({
      label,
      value,
    }));
  }

  get value() {
    return null;
  }

  get name() {
    return 'country';
  }

  change(event) {
    dispatchCustomEvent('updateOrderData', {
      value: event.target.value,
      name: this.name,
    });
  }
}

window.customElements.define('country-select', CountrySelect);

class LanguageSelect extends SelectElement {
  get labelText() {
    return 'Language';
  }

  get id() {
    return ids.LANGUAGE_SELECT;
  }

  get options() {
    const optionLanguages = [
      {
        value: 'en',
        label: 'English',
      },
      ...Object.keys(languages).map(key => {
        const { nativeName, name } = languages[key];
        return {
          value: key,
          label: `${nativeName} (${name})`,
        };
      }),
    ];
    return optionLanguages.sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
  }

  get value() {
    return 'en';
  }

  get name() {
    return 'language';
  }

  change(event) {
    map.language = event.target.value;
  }
}

window.customElements.define('language-select', LanguageSelect);

class FontSelect extends SelectElement {
  get labelText() {
    return 'Font family';
  }

  get id() {
    return ids.FONT_SELECT;
  }

  get options() {
    return fonts.map(font => ({
      label: font,
      value: font.replace(' ', '+'),
    }));
  }

  get value() {
    return 'Bellefair';
  }

  get name() {
    return 'font';
  }

  change(event) {
    const newFont = event.target.value;
    const headID = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    headID.appendChild(link);
    link.href = `http://fonts.googleapis.com/css?family=${newFont}`;
    document.querySelector('#subWrapper').style.fontFamily = newFont.replace(
      '+',
      ' '
    );
  }
}

window.customElements.define('font-select', FontSelect);
