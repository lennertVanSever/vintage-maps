import { initialTitle } from '../map/utils.js';
import { dispatchCustomEvent } from '../utils';
import { ShadowElement } from './shadowElement.js';
import { formElementStyle, labelStyle } from './sharedStyle.js';

class TextInput extends ShadowElement {
  constructor() {
    super();
    this.shadowRoot
      .querySelector('input')
      .addEventListener('change', this.change.bind(this));
    window.addEventListener('validateInput', this.handleValidation.bind(this));
  }

  handleValidation({ detail }) {
    const operation = detail.type === 'INVALID' ? 'add' : 'remove';
    if (detail.name === this.name) {
      this.shadowRoot.querySelector('label').classList[operation]('error');
    }
  }

  change(event) {
    dispatchCustomEvent('updateOrderData', {
      value: event.target.value,
      name: this.name,
    });
  }

  get htmlString() {
    return /* html */ `
      <style>
        ${labelStyle}
        input {
          ${formElementStyle}
        }
        .errorText {
          display: none;
          color: var(--red);
        }
        .error .errorText {
          display: block;
        }
      </style>
      <label>
        ${this.labelText}
        <div id="hint">${this.hintText}</div>
        <div id="hint" class="errorText">Please fill in this field</div>
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
    const attributeValue = this.getAttribute('name');
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

  orderSubmit() {
    // console.log(this.name);
  }

  keyUp(event) {
    dispatchCustomEvent('updateMapTitle', {
      value: event.target.value,
    });
  }

  get labelText() {
    return 'Title';
  }

  get initialValue() {
    return initialTitle;
  }
}

window.customElements.define('title-input', TitleInput);
