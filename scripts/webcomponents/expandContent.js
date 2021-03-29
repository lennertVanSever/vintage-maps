import { ShadowElement } from './shadowElement.js';
import { resetButton } from './sharedStyle.js';

const closedButtonText = 'Show more editing option'; // factor this out

class ExpandContent extends ShadowElement {
  constructor() {
    super();
    this.button = this.shadowRoot.querySelector('button');
    this.slotWrapper = this.shadowRoot.querySelector('#slotWrapper');
    this.button.addEventListener('click', this.openOrClose.bind(this));

    this.closed = true;
    this.openButtonText = 'Hide more editing option';
  }

  openOrClose() {
    if (this.closed) {
      this.closed = false;
      this.slotWrapper.style.display = 'block';
      this.button.innerText = this.openButtonText;
    } else {
      this.closed = true;
      this.slotWrapper.style.display = 'none';
      this.button.innerText = closedButtonText;
    }
  }

  get htmlString() {
    return /* html */ `
      <style>
        button {
          ${resetButton}
          cursor: pointer;
          text-decoration: underline;
          font-weight: bold;
        }
        #slotWrapper {
          display: none;
        }
      </style>
      <div>
        <button data-cy="expandContentButton">${closedButtonText}</button>
        <div id="slotWrapper">
          <slot></slot>
        </div>
      </div>
     `;
  }
}

window.customElements.define('expand-content', ExpandContent);
