import { initial } from '../utils';
import { ShadowElement } from './shadowElement.js';

class OnlyShowWhenCustomStyleEnabled extends ShadowElement {
  constructor() {
    super();
    this.editingMode = false;
    window.addEventListener('styleChange', this.handleStyleChange.bind(this));
    this.handleStyleChange({ detail: { value: initial.style } });
  }

  handleStyleChange({ detail: { value } }) {
    if (value === 'custom' || this.editingMode) {
      this.shadowRoot.querySelector('slot').style.display = 'block';
    } else {
      this.shadowRoot.querySelector('slot').style.display = 'none';
    }
  }

  get htmlString() {
    return /* html */ `
      <style>
        slot {
          display: none;
        }
      </style>
      <slot></slot>
     `;
  }
}

window.customElements.define(
  'only-show-when-custom-style-enabled',
  OnlyShowWhenCustomStyleEnabled
);
