import { initialTitle } from '../map/utils.js';
import { ShadowElement } from './shadowElement.js';
import { formElementStyle, labelStyle } from './sharedStyle.js';

class TextInput extends ShadowElement {
  get htmlString() {
    return /* html */ `
      <style>
        ${labelStyle}
        input {
          ${formElementStyle}
        }
      </style>
      <label>
        ${this.labelText}
        <div id="hint">${this.hintText}</div>
        <input id=${this.name} name=${this.name} value="${this.initialValue}" type="text"/>
      </label>
     `;
  }

  get labelText() {
    return this.getAttribute('labelText');
  }

  get hintText() {
    const attributeValue = this.getAttribute('hintText');
    if (!attributeValue) return '';
    return attributeValue;
  }

  get name() {
    const attributeValue = this.getAttribute('hintText');
    if (!attributeValue) return '';
    return attributeValue;
  }

  get initialValue() {
    return '';
  }
}

window.customElements.define('text-input', TextInput);

class TitleInput extends TextInput {
  constructor() {
    super();
    this.shadowRoot
      .querySelector('input')
      .addEventListener('keyup', this.keyUp);
  }

  keyUp(event) {
    const newCustomEvent = new CustomEvent('updateMapTitle', {
      detail: {
        value: event.target.value,
      },
    });
    window.dispatchEvent(newCustomEvent);
  }

  get labelText() {
    return 'Title';
  }

  get initialValue() {
    return initialTitle;
  }
}

window.customElements.define('title-input', TitleInput);
