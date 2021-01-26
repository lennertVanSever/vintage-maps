import { addParameterToURL, initialTitle } from '../map/utils.js';
import { ShadowElement } from './shadowElement.js';

class MapWrapper extends ShadowElement {
  constructor() {
    super();
    window.addEventListener('updateMapTitle', this.updateMapTitle.bind(this));

    this.title = initialTitle;
  }

  updateMapTitle(event) {
    this.title = event.detail.value;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    addParameterToURL('title', value);
    this._title = value;
    this.shadowRoot.getElementById('title').innerText = value;
  }

  get htmlString() {
    return /* html */ `
      <style>
        section {
          margin: var(--margin-3);
        }
        #title {
          text-align: center;
          font-family: "bodoni";
          font-size: 20px;
          margin-bottom: var(--margin-1);
          color: var(--black);
        }
        #firstBorder {
          border: 3px solid var(--black);
          padding: var(--margin-2);
      
          height: calc((100vw - 36px) / 4 * 3);
          /* width: calc(100vw - var(--margin-6)); */
        }
        #secondBorder {
          border: 1px solid var(--black);
          height: calc(100% - 3px);
        }
      </style>
      <section>
        <div id="title">My custom title</div>
        <div id="firstBorder">
          <div id="secondBorder">
            <slot></slot>
          </div>
        </div>
      </section>
     `;
  }
}

window.customElements.define('map-wrapper', MapWrapper);
