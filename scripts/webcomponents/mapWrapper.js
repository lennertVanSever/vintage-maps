import { ShadowElement } from './shadowElement.js';

class MapWrapper extends ShadowElement {
  constructor() {
    super();
  }

  get htmlString() {
    return /* html */ `
      <style>
        section {
          margin: 10px;
        }
        #title {
          text-align: center;
          font-family: "bodoni";
          font-size: 20px;
          margin-bottom: 2px;
          color: var(--black);
        }
        #firstBorder {
          border: 3px solid var(--black);
          padding: 5px;
      
          height: calc((100vw - 36px) / 4 * 3);
          width: calc(100vw - 36px);
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
