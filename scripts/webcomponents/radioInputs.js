import { dispatchCustomEvent, initial } from '../utils';
import { ShadowElement } from './shadowElement.js';
import { labelStyleRaw } from './sharedStyle';

class RadioInputs extends ShadowElement {
  constructor() {
    super();
    this.addEventListeners();
  }

  addEventListeners() {
    this.shadowRoot.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', this.handleInputChange.bind(this));
    });
  }

  get htmlString() {
    return /* html */ `
      <style>
        #wrapper {
          ${labelStyleRaw}
        }
        #title {
          margin-bottom: var(--margin-3);
        }
        /* Customize the label (the container) */
        .container {
          display: block;
          position: relative;
          padding-left: 30px;
          margin-bottom: 12px;
          margin-top: 10px;
          cursor: pointer;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .container:first-of-type {
          margin-top: 0px;
        }

        /* Hide the browser's default radio button */
        .container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        /* Create a custom radio button */
        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          border: 1px solid var(--black);
          border-radius: 50%;
        }

        /* On mouse-over, add a grey background color */
        .container:hover input ~ .checkmark {
          background-color: #ccc;
        }

        /* When the radio button is checked, add a blue background */
        .container input:checked ~ .checkmark {
          background-color: var(--black);
        }

        /* Create the indicator (the dot/circle - hidden when not checked) */
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        /* Show the indicator (dot/circle) when checked */
        .container input:checked ~ .checkmark:after {
          display: block;
        }

        /* Style the indicator (dot/circle) */
        .container .checkmark:after {
          top: 7px;
          left: 7px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--body-color);
        }

        .labelText {
          position: relative;
          top: 2px;
        }

      </style>
      <div id="wrapper">
        <div id="title">
          ${this.title}
        </div>
        <div id="inputWrapper">
        ${this.optionsHtml}
        </div>
      </div>
     `;
  }

  get valueLabel() {
    let valueLabel;
    this.options.forEach(({ value, label }) => {
      if (value === this.value) valueLabel = label;
    });
    return valueLabel;
  }

  get valueIndex() {
    let valueIndex;
    this.options.forEach(({ value }, index) => {
      if (value === this.value) valueIndex = index;
    });
    return valueIndex;
  }

  get optionsHtml() {
    return this.options
      .map(
        ({ label, value }) => /* html */ `
          <label class="container">
            <span class="labelText">
              ${label}
            </span>
            <input
              ${this.value === value ? 'checked' : ''}
              name="${this.name}"
              value="${value}"
              type="radio"
            >
            <span class="checkmark"></span>
          </label>
          `
      )
      .join('');
  }
}

window.customElements.define('radio-input', RadioInputs);

class RadioMapDirection extends RadioInputs {
  set value(value) {
    this._value = value;
  }

  get value() {
    return this._value || initial.direction;
  }

  get title() {
    return 'Map direction';
  }

  get name() {
    return 'map-direction';
  }

  handleInputChange({ target: { value } }) {
    dispatchCustomEvent('directionChange', { value });
  }

  get options() {
    return [
      {
        label: 'Landscape',
        value: 'landscape',
      },
      {
        label: 'Portrait',
        value: 'portrait',
      },
    ];
  }
}

window.customElements.define('radio-map-direction', RadioMapDirection);

class RadioMapSizes extends RadioInputs {
  constructor() {
    super();
    window.addEventListener('directionChange', this.changeDirection.bind(this));
  }

  changeDirection({ detail: { value: direction } }) {
    const previousValueIndex = this.valueIndex;
    this.direction = direction;
    this.value = this.options[previousValueIndex].value;
    this.shadowRoot.querySelector('#inputWrapper').innerHTML = this.optionsHtml;
    this.addEventListeners();
  }

  handleInputChange({ target: { value } }) {
    this.value = value;
  }

  set value(value) {
    this._value = value;
    dispatchCustomEvent('sizeChange', { value, label: this.valueLabel });
  }

  get value() {
    return this._value || initial.size.value;
  }

  get title() {
    return 'Map size';
  }

  get name() {
    return 'map-size';
  }

  get isLandscape() {
    return this.direction === initial.direction || this.direction === undefined;
  }

  get options() {
    const baseWidth = this.isLandscape ? 30 : 20;
    const baseHeight = this.isLandscape ? 20 : 30;

    return [1, 2, 3].map(index => {
      const width = baseWidth * index;
      const height = baseHeight * index;
      return {
        label: `${width}cm x ${height}cm`,
        value: `${width}x${height}`,
      };
    });
  }
}

window.customElements.define('radio-map-sizes', RadioMapSizes);

class RadioMapMaterial extends RadioInputs {
  set value(value) {
    this._value = value;
  }

  get value() {
    return this._value || initial.material.value;
  }

  get title() {
    return 'Map material';
  }

  get name() {
    return 'map-material';
  }

  handleInputChange({ target: { value } }) {
    this.value = value;
    dispatchCustomEvent('materialChange', { value, label: this.valueLabel });
  }

  get options() {
    return [
      {
        label: 'Canvas',
        value: 'canvas',
      },
      {
        label: 'Wood',
        value: 'berkenplex',
      },
      {
        label: 'Aluminium',
        value: 'aluminium',
      },
      {
        label: 'Plexiglas',
        value: 'plexiglas',
      },
    ];
  }
}

window.customElements.define('radio-map-material', RadioMapMaterial);
