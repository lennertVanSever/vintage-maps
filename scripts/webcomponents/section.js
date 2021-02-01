/* eslint-disable max-classes-per-file */
import { router } from '../utils';
import { ShadowElement } from './shadowElement.js';

class Section extends ShadowElement {
  constructor() {
    super();
    this.wrapper = this.shadowRoot.querySelector('#wrapper');
    const secondButton = this.shadowRoot.querySelector('#secondButton');
    const firstButton = this.shadowRoot.querySelector('#firstButton');
    firstButton.addEventListener('click', this.onClickFirstButton.bind(this));
    secondButton.addEventListener('click', this.onClickSecondButton.bind(this));
    window.addEventListener('showSection', this.handleShowSection.bind(this));
  }

  hideSection() {
    this.wrapper.style.display = 'none';
  }

  showSection() {
    this.wrapper.style.display = 'block';
  }

  handleShowSection(event) {
    if (this.sectionRoute !== event.detail.name) {
      this.hideSection();
    } else {
      this.showSection();
    }
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

        #inputElements {
          padding: 0px var(--margin-3);
          padding-bottom: 100px;
        }

        #wrapper {
          display: none;
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
          #inputElements {
            width: calc(100% - var(--margin-6));
            margin: 0px 0px;
            padding-bottom: 60px;
          }
        }

      </style>
      <div id="wrapper">
        <div id="inputElements">
          <slot></slot>
        </div>
        <div id="buttonWrapper">
        <button id="firstButton">${this.firstButtonText}</button>
        <button id="secondButton">${this.secondButtonText}</button>
      </div>
     </div>
     `;
  }
}

class CustomizeSection extends Section {
  onClickSecondButton() {
    router.navigate(`/order${window.location.search}`);
  }

  onClickFirstButton() {
    console.info('reset');
  }

  get sectionRoute() {
    return '/';
  }

  get firstButtonText() {
    return 'Reset';
  }

  get secondButtonText() {
    return 'Order';
  }
}

window.customElements.define('customize-section', CustomizeSection);

class OrderSection extends Section {
  onClickFirstButton() {
    router.navigate(`/${window.location.search}`);
  }

  onClickSecondButton() {
    router.navigate(`/checkout${window.location.search}`);
  }

  get sectionRoute() {
    return '/order';
  }

  get firstButtonText() {
    return 'Back';
  }

  get secondButtonText() {
    return 'Next';
  }
}

window.customElements.define('order-section', OrderSection);

class CheckoutSection extends Section {
  onClickFirstButton() {
    router.navigate(`/order${window.location.search}`);
  }

  onClickSecondButton() {
    console.info('checkout');
  }

  get sectionRoute() {
    return '/checkout';
  }

  get firstButtonText() {
    return 'Back';
  }

  get secondButtonText() {
    return 'Checkout';
  }
}

window.customElements.define('checkout-section', CheckoutSection);
