/* eslint-disable max-classes-per-file */
import { map } from '../index.js';
import { ShadowElement } from './shadowElement.js';
import { labelStyle } from './sharedStyle.js';

class ToggleSwitch extends ShadowElement {
  constructor() {
    super();
    this.shadowRoot
      .querySelector('input')
      .addEventListener('change', this.change.bind(this));
  }

  updateStatusText(event) {
    let newText = 'Off';
    if (event.target.checked) newText = 'On';
    this.shadowRoot.getElementById('statusText').innerText = newText;
  }

  get htmlString() {
    return /* html */ `
      <style>
        ${labelStyle}
        
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
          margin-top: var(--margin-2);
          margin-right: var(--margin-3);
        }

        /* Hide default HTML checkbox */
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        /* The slider */
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--body);
          border: 1px solid var(--black);
          -webkit-transition: 0.2s;
          transition: 0.2s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 3px;
          bottom: 3px;
          background-color: var(--black);
          -webkit-transition: 0.2s;
          transition: 0.2s;
        }

        input:checked + .slider {
          background-color: var(--black);
        }

        input:focus + .slider {
          box-shadow: 0 0 1px var(--black);
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
          background-color: var(--body);
        }

        /* Rounded sliders */
        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .switchWrapper {
          display: flex;
          align-items: center;
        }
      </style>
      <label>
        <div>
          ${this.labelText}
        </div>
        <div class="switchWrapper">
          <div class="switch">
            <input checked type="checkbox">
            <span class="slider round"></span>
          </div>
          <div id="statusText">On</div>
        </div>
      </label>
     `;
  }
}

window.customElements.define('toggle-switch', ToggleSwitch);

class HideOrShowToggle extends ToggleSwitch {
  get elementToHideSelector() {
    return this.getAttribute('elementToHideSelector');
  }

  get labelText() {
    return this.getAttribute('labelText');
  }

  showOrHideElement(event) {
    map.showOrHideElements(event.target.checked, this.elementToHideSelector);
  }

  change(event) {
    super.updateStatusText(event);
    this.showOrHideElement(event);
  }
}

window.customElements.define('hide-or-show-toggle', HideOrShowToggle);
