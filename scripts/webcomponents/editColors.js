import colors from '../map/colors';
import { isLocalHost } from '../utils';
import { ShadowElement } from './shadowElement';
import { labelStyleRaw } from './sharedStyle';

class EditColorInput extends ShadowElement {
  constructor() {
    super();
    this.mapStyle = 'defaultColors';
    this.input = this.shadowRoot.querySelector('input');
    window.addEventListener('styleChange', this.styleChanged.bind(this));
    this.input.addEventListener('input', this.handleOnInput.bind(this));
    this.input.addEventListener('change', this.handleOnChange.bind(this));
  }

  get selectedColorset() {
    return colors[this.mapStyle];
  }

  get color() {
    if (this.borderIndex) {
      return this.selectedColorset.insideBorders[this.borderIndex];
    }
    return this.selectedColorset[this.cssVariable];
  }

  async saveColors(newColors) {
    if (isLocalHost) {
      const responseRaw = await fetch('http://localhost:9000/modify_colors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          styleName: this.mapStyle,
          colors: newColors,
        }),
      });
      const response = await responseRaw.json();
      console.info(response);
    }
  }

  handleOnChange({ target: { value } }) {
    const newColors = {
      ...this.selectedColorset,
    };
    if (this.borderIndex) {
      newColors.insideBorders[this.borderIndex] = value;
    } else {
      newColors[this.cssVariable] = value;
    }
    this.saveColors(newColors);
  }

  styleChanged(event) {
    this.mapStyle = event.detail.value;
    this.input.value = this.color;
  }

  handleOnInput(event) {
    document.documentElement.style.setProperty(
      `--${this.cssVariable}`,
      event.target.value
    );
  }

  get cssVariable() {
    return this.getAttribute('cssVariable');
  }

  get borderIndex() {
    return this.getAttribute('borderIndex');
  }

  set mapStyle(mapStyle) {
    return (this._mapStyle = mapStyle);
  }

  get mapStyle() {
    return this._mapStyle || 'defaultColors';
  }

  get htmlString() {
    return /* html */ `
      <style>
        input[type="color"] {
          padding: 0;
          -webkit-appearance: none;
          border: 1px solid var(--black);
          margin-right: var(--margin-4);
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
        }
        div {
          display: flex;
          align-items: center;
          margin-top: var(--margin-4);
        }
      </style>
      <div>
        <input value="${this.color}" type="color">
        ${this.cssVariable}
      </div>
      `;
  }
}

window.customElements.define('edit-color-input', EditColorInput);

class EditColors extends ShadowElement {
  constructor() {
    super();
  }

  get htmlString() {
    return /* html */ `
      <style>
        #wrapper {
          ${labelStyleRaw}
        }
      </style>
      <div id="wrapper">
        <div>
          Edit colors
        </div>
        ${Object.keys(colors.defaultColors)
          .map(key => {
            const value = colors.defaultColors[key];
            if (typeof value === 'string') {
              return /* html */ `
              <edit-color-input cssVariable="${key}"></edit-color-input>
            `;
            }
            return value
              .map((_, index) => {
                return /* html */ `
              <edit-color-input  borderIndex="${index}" cssVariable="border-${index}"></edit-color-input>
            `;
              })
              .join('');
          })
          .join('')}
      </div>
     `;
  }
}

window.customElements.define('edit-colors', EditColors);
