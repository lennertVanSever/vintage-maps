import { initialTitle } from '../map/utils.js';
import { ShadowElement } from './shadowElement.js';
import { formElementStyle, labelStyle } from './sharedStyle.js';

class TitleInput extends ShadowElement {
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

  get htmlString() {
    return /* html */ `
      <style>
        ${labelStyle}
        input {
          ${formElementStyle}
        }
      </style>
      <label>
        Title
        <input value="${initialTitle}" type="text"/>
      </label>
     `;
  }
}

window.customElements.define('title-input', TitleInput);
