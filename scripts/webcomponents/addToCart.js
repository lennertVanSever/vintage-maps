import { router } from '../utils';
import { ShadowElement } from './shadowElement.js';

// console.log(Buffer.from);
class AddToCart extends ShadowElement {
  constructor() {
    super();
    const printButton = this.shadowRoot.querySelector('#print');
    printButton.addEventListener('click', this.onClickPrint.bind(this));
  }

  onClickPrint() {
    router.navigate(`/order${window.location.search}`);
  }

  get htmlString() {
    return /* html */ `
      <style>
         #buttonWrapper {
          display: flex;
          position: fixed;
          bottom: 0;
          width: 100%;
        }

        #buttonWrapper button:nth-child(2) {
          background-color: var(--black);
          color: var(--body-color);
        }
        button {
          display: block;
          width: 50%;
          appearance: none;
          padding: var(--margin-4) 0px;
          border: 1px solid var(--black);
          background-color: var(--body-color);
        }
        @media only screen and (min-width:768px) {
          #buttonWrapper {
            background-color: var(--body-color);
            width: 243px;
            right: 34px;
            justify-content: space-between;
            box-shadow: 0px -4px 3px var(--body-color);
          }
          #buttonWrapper button {
            width: calc(50% - (var(--margin-4) / 2));
            margin-bottom: var(--margin-4);
            margin-top: var(--margin-2);
          }
        }

      </style>
      <div id="buttonWrapper">
       <button>Download</button>
       <button id="print">Order</button>
     </div>
     `;
  }
}

window.customElements.define('add-to-cart', AddToCart);
