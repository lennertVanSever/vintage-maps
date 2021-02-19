import { addParameterToURL } from '../map/utils.js';
import { initial } from '../utils';
import { ShadowElement } from './shadowElement.js';

class MapWrapper extends ShadowElement {
  constructor() {
    super();
    window.addEventListener('updateMapTitle', this.updateMapTitle.bind(this));

    this.title = initial.title;
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
          position: sticky;
          top: 0;
          padding: var(--margin-3);
          padding-bottom: 0;
          background-color: var(--body);
          z-index: 1;
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
        @media only screen and (min-width:768px) {
          section {
            width: calc(100vw - 300px);
            display: flex;
            justify-content: center;
          }
          #subWrapper {
            width: calc((100vh - 55px) * 4 / 3);
            height: calc(100vh - 55px);
          }
          #firstBorder {
            height: 100%;
            width: 100%;
          }
        }
      </style>
      <section>
        <div id="subWrapper">
          <div id="title">My custom title</div>
          <div id="firstBorder">
            <div id="secondBorder">
              <slot></slot>
            </div>
          </div>
        </div>
      </section>
     `;
  }
}

window.customElements.define('map-wrapper', MapWrapper);
