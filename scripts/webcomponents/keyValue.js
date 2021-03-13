import { ShadowElement } from './shadowElement.js';

class keyValue extends ShadowElement {
  get valueText() {
    return this.getAttribute('valueText');
  }

  get keyText() {
    return this.getAttribute('keyText');
  }

  get attention() {
    return this.getAttribute('attention');
  }

  get vertical() {
    return this.getAttribute('vertical');
  }

  get htmlString() {
    return /* html */ `
      <style>
        .wrapper {
          display: flex;
          justify-content: space-between;
          margin: var(--margin-6) 0px;
        }
        .vertical {
          display: block;
        }
        .vertical #key {
          font-weight: bold;
          margin-bottom: var(--margin-1);
        }
        .attention #key, .attention #value {
          font-weight: bold;
          font-size: 18px;
        }
      </style>
      <div
        class=${`"wrapper ${this.attention ? 'attention' : ''} ${
          this.vertical ? 'vertical' : ''
        }"`}
      >
        <div id="key">${this.keyText}</div>
        <div id="value">${this.valueText}</div>
      </div>
     `;
  }
}

window.customElements.define('key-value', keyValue);
