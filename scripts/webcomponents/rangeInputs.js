// eslint-disable-next-line max-classes-per-file
import { map } from '../index.js';
import { ShadowElement } from './shadowElement.js';
import { labelStyle } from './sharedStyle.js';

class RangeInput extends ShadowElement {
  constructor() {
    super();
    this.rangeInput = this.shadowRoot.querySelector('input');
    this.rangeInput.addEventListener(
      'input',
      this.handleInputChange.bind(this)
    );
  }

  handleInputChange(event) {
    this.value = event.target.value;

    event.target.style.background = `linear-gradient(to right, var(--black) 0%, var(--black) ${this.relativeValue}%, transparent ${this.relativeValue}%, transparent 100%)`; // https://stackoverflow.com/questions/18389224/how-to-style-html5-range-input-to-have-different-color-before-and-after-slider
    this.handleChildInputChange();
  }

  get min() {
    return this.getAttribute('min');
  }

  get max() {
    return this.getAttribute('max');
  }

  get value() {
    return this.getAttribute('value');
  }

  get step() {
    return this.getAttribute('step');
  }

  set value(newValue) {
    this.setAttribute('value', newValue);
  }

  get relativeValue() {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  get htmlString() {
    return /* html */ `
      <style>
        ${labelStyle}
        input {
          display: block;
          background: linear-gradient(to right, var(--black) 0%, var(--black) ${this.relativeValue}%, transparent ${this.relativeValue}%, transparent 100%);
          border: 1px solid var(--black);
          height: 3px;
          width: calc(100% - var(--margin-2));
          outline: none;
          -webkit-appearance: none;
          margin-top: var(--margin-4);
        }
        input::-webkit-slider-thumb  {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: var(--black);
          cursor: pointer;
        }
      </style>
      <label>
        <div>
          ${this.labelText}
        </div>
        <input type="range" step=${this.step} min=${this.min} max=${this.max} value=${this.value} class="slider">
      </label>
     `;
  }
}

window.customElements.define('range-input', RangeInput);

class RangeMapProperty extends RangeInput {
  get labelText() {
    return this.getAttribute('labelText');
  }

  get mapProperty() {
    return this.getAttribute('mapProperty');
  }

  handleChildInputChange() {
    map[this.mapProperty] = this.value;
  }
}

window.customElements.define('range-map-property', RangeMapProperty);
