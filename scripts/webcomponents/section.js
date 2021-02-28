/* eslint-disable max-classes-per-file */
import {
  generateMapUrl,
  getOrderDetails,
  goToPayment,
  orderPrint,
  stripeCheckout,
} from '../checkout';
import {
  dispatchCustomEvent,
  fallBackTitle,
  initialUrl,
  router,
} from '../utils';
import { ShadowElement } from './shadowElement.js';

class Section extends ShadowElement {
  constructor() {
    super();
    this.superWrapper = this.shadowRoot.querySelector('#superWrapper');
    this.generalError = this.shadowRoot.querySelector('#generalError');
    this.inputElements = this.shadowRoot.querySelector('#inputElements');
    this.secondButton = this.shadowRoot.querySelector('#secondButton');
    this.firstButton = this.shadowRoot.querySelector('#firstButton');
    this.firstButton.addEventListener(
      'click',
      this.onClickFirstButton.bind(this)
    );
    this.secondButton.addEventListener(
      'click',
      this.onClickSecondButton.bind(this)
    );
    window.addEventListener('showSection', this.handleShowSection.bind(this));
    if (this.handleProductChange) {
      window.addEventListener(
        'productChange',
        this.handleProductChange.bind(this)
      );
    }
  }

  updateTextSecondButton() {
    this.secondButton.innerText = this.secondButtonText;
  }

  hideSection() {
    this.superWrapper.style.display = 'none';
  }

  showSection() {
    this.superWrapper.style.display = 'block';
  }

  handleShowSection(event) {
    if (this.sectionRoute !== event.detail.name) {
      this.hideSection();
    } else {
      this.showSection();
      if (this.handleExtraOpenSection) this.handleExtraOpenSection();
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

        #superWrapper {
          display: none;
        }

        #buttonWrapper button:nth-child(2) {
          background-color: var(--black);
          color: var(--body);
        }

        button {
          display: block;
          width: 50%;
          appearance: none;
          padding: var(--margin-4) 0px;
          border: 1px solid var(--black);
          background-color: var(--body);
        }

        #inputElements {
          padding: 0px var(--margin-5);
          padding-bottom: 100px;
          box-sizing: border-box;
        }

        #wrapper {
          position: relative;
          width: 100%;
        }

        #generalError {
          width: 100%;
          border: 2px solid var(--red);
          padding: 20px;
          background-color: white;
          color: var(--red);
          box-sizing: border-box;
          margin-top: var(--margin-6);
          text-align: center;
          font-weight: bold;
          display: none;
        }

        hr {
          border: none;
          height: 1px;
          background-color: #dbd4ad;
          margin: var(--margin-7) 0px;
        }

        h3 {
          margin-bottom: calc(var(--margin-4) * -1);
        }

        @media only screen and (min-width:768px) {
          #buttonWrapper {
            padding: 0px var(--margin-5);
            box-sizing: border-box;
            background-color: var(--body);
            width: 300px;
            right: 0px;
            justify-content: space-between;
            box-shadow: 0px -4px 3px var(--body);
          }
          #buttonWrapper button {
            width: calc(50% - (var(--margin-4) / 2));
            margin-bottom: var(--margin-4);
            margin-top: var(--margin-2);
          }
          #inputElements {
            width: 100%;
            margin: 0px 0px;
            padding-bottom: 60px;
          }
          #superWrapper {
            width: 300px;
            display: flex;
            align-items: center;
            flex-direction: column;
            border-left: 1px solid var(--black);
            height: calc(100vh - var(--height-header));
            overflow: auto;
            position: relative;
          }
        }

      </style>
      <article id="superWrapper">
        <div id="wrapper">
          <div id="inputElements">
            <div id="generalError">Please fill in all the fields</div>

            <slot></slot>
          </div>
          <div id="buttonWrapper">
            <button id="firstButton">${this.firstButtonText}</button>
            <button id="secondButton">${this.secondButtonText}</button>
          </div>
        </div>
      </article>
     `;
  }
}

class CustomizeSection extends Section {
  handleProductChange({ detail }) {
    this.product = detail;
    this.secondButtonText = `€${this.product.price} • Order`;
    this.title = fallBackTitle;
    window.addEventListener('updateMapTitle', this.updateMapTitle.bind(this));
  }

  updateMapTitle({ detail: { value } }) {
    this.title = value;
  }

  onClickSecondButton() {
    if (
      this.title !== fallBackTitle ||
      window.confirm(
        `Are you sure you want to order a map with the title "${this.title}"`
      )
    ) {
      generateMapUrl(this.product.printExactSize);
      router.navigate(`/order${window.location.search}`);
    }
  }

  onClickFirstButton() {
    generateMapUrl(this.product.printExactSize);
    router.navigate(`/prepare-download${window.location.search}`);
  }

  get sectionRoute() {
    return '/';
  }

  get firstButtonText() {
    return 'Download';
  }

  get secondButtonText() {
    return this._secondButtonText || 'Order';
  }

  set secondButtonText(value) {
    this._secondButtonText = value;
    this.updateTextSecondButton();
  }
}

window.customElements.define('customize-section', CustomizeSection);

class OrderSection extends Section {
  constructor() {
    super();
    this.formData = {
      email: '',
      name: '',
      address: '',
      zip: '',
      city: '',
      country: 'AF',
    };

    // this.formData = {
    //   email: 'lennert_vansever@hotmail.be',
    //   name: 'Lennert Van Sever',
    //   address: 'Grensstraat 40',
    //   zip: '1210',
    //   city: 'Sint-Joost-ten-Node',
    //   country: 'BE',
    // };
    window.addEventListener('mapUrl', this.handleMapUrlChange.bind(this));
    window.addEventListener('updateOrderData', this.updateFormData.bind(this));
    this.pdfFile = '';
    this.sendOrderWhenPdfFileIsReady = false;
  }

  handleProductChange({ detail }) {
    this.product = detail;
  }

  handleMapUrlChange(event) {
    if (event.detail.state === 'LOADING') {
      this.pdfFile = 'LOADING';
    }
    if (event.detail.state === 'SUCCESS') {
      this.pdfFile = event.detail.data.fileLink;
      if (this.sendOrderWhenPdfFileIsReady) {
        orderPrint(this.orderData);
      }
    }
  }

  onClickFirstButton() {
    router.navigate(`/${window.location.search}`);
  }

  updateFormData({ detail }) {
    this.formData[detail.name] = detail.value;
  }

  isValidFormData() {
    let valid = true;
    Object.keys(this.formData).forEach(name => {
      if (!this.formData[name]) {
        valid = false;
        dispatchCustomEvent('validateInput', {
          name,
          type: 'INVALID',
        });
      } else {
        dispatchCustomEvent('validateInput', {
          name,
          type: 'VALID',
        });
      }
    });
    return valid;
  }

  get orderData() {
    return {
      email: this.formData.email,
      items: [
        {
          productId: this.product.id,
          quantity: 1,
          files: {
            content: this.pdfFile,
          },
        },
      ],
      shipping: {
        address: {
          name: this.formData.name,
          line1: this.formData.address,
          postCode: this.formData.zip,
          city: this.formData.city,
          country: this.formData.country,
        },
      },
    };
  }

  onClickSecondButton() {
    if (this.isValidFormData()) {
      this.hideGeneralError();
      router.navigate(`/checkout${window.location.search}`);
      if (this.pdfFile === 'LOADING') {
        this.sendOrderWhenPdfFileIsReady = true;
      } else {
        orderPrint(this.orderData);
      }
    } else {
      this.showGeneralError();
    }
  }

  hideGeneralError() {
    this.generalError.style.display = 'none';
  }

  showGeneralError() {
    this.generalError.style.display = 'block';
    this.generalError.scrollIntoView(false);
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
  constructor() {
    super();
    window.addEventListener('orderData', this.handleChangeOrderData.bind(this));
  }

  handleChangeOrderData(event) {
    if (event.detail.state === 'SUCCESS') {
      this.data = event.detail.data;
      this.inputElements.innerHTML = this.summary;
    }
  }

  addCurrency(number) {
    return `€${number}`;
  }

  calculatePriceWithTaxes({ cost, taxes: [{ amount }] }) {
    return this.addCurrency(Math.round((cost + amount) * 100) / 100);
  }

  handleProductChange({ detail }) {
    this.product = detail;
  }

  get summary() {
    const {
      checkout: { amount },
      email,
      shipping: {
        address: { city, country, line1: address, name, postCode },
      },
      invoice: { shipping, handling },
    } = this.data;

    return /* html */ `
      <h3>Price summary</h3>
      <key-value
        keyText="Subtotal"
        valueText="${this.addCurrency(this.product.price)}"
      ></key-value>
      <key-value keyText="Shipping fee" valueText="${this.calculatePriceWithTaxes(
        shipping
      )}"></key-value>
      <key-value keyText="Handling" valueText="${this.calculatePriceWithTaxes(
        handling
      )}"></key-value>
      <key-value
        keyText="Total"
        valueText="${this.addCurrency(amount)}"
        attention="1"
      ></key-value>
      <hr>
      <h3>Shipping details</h3>
      <key-value
        keyText="Product"
        valueText="${this.product.name}"
        vertical="1"
      >
      </key-value>
      <key-value keyText="Name" valueText="${name}" vertical="1"></key-value>
      <key-value keyText="Email" valueText="${email}" vertical="1"></key-value>
      <key-value keyText="Address" valueText="${address}" vertical="1"></key-value>
      <key-value keyText="Postal code" valueText="${postCode}" vertical="1"></key-value>
      <key-value keyText="City" valueText="${city}" vertical="1"></key-value>
      <key-value keyText="Country" valueText="${country}" vertical="1"></key-value>
    `;
  }

  onClickFirstButton() {
    router.navigate(`/order${window.location.search}`);
  }

  onClickSecondButton() {
    goToPayment(this.data);
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

class OrderStatusSection extends Section {
  get sectionRoute() {
    return '/status-order';
  }

  get orderId() {
    const newUrl = new URL(window.location.href);
    return newUrl.searchParams.get('orderId');
  }

  async handleExtraOpenSection() {
    this.data = await getOrderDetails({ id: this.orderId });
    this.status = this.data.checkout.status;
    if (this.status === 'Successful') {
      this.inputElements.innerHTML = this.confirmation;
      this.firstButton.innerText = 'New map';
      this.secondButton.innerText = 'Same map';
    } else if (this.status === 'Open') {
      this.inputElements.innerHTML = this.failedPaymenent;
      this.firstButton.innerText = 'Cancel';
      this.secondButton.innerText = 'Try again';
    }
  }

  get failedPaymenent() {
    return /* html */ `
      <h3>⚠️ &nbsp;Something went wrong</h3>
      <p>Unfortunately we couldn't handle your payment, do you want to try again?</p>
    `;
  }

  get confirmation() {
    const {
      email,
      shipping: {
        address: { city, country, line1: address, name, postCode },
      },
    } = this.data;

    return /* html */ `
      <h3>✅ &nbsp;Payment complete</h3>
      <p>Thank you, your payment has been succesful. A confirmation email has been sent to ${email}</p>
      <hr>
      <h3>Shipping details</h3>
      <key-value keyText="Name" valueText="${name}" vertical="1"></key-value>
      <key-value keyText="Address" valueText="${address}" vertical="1"></key-value>
      <key-value keyText="Postal code" valueText="${postCode}" vertical="1"></key-value>
      <key-value keyText="City" valueText="${city}" vertical="1"></key-value>
      <key-value keyText="Country" valueText="${country}" vertical="1"></key-value>
    `;
  }

  onClickSecondButton() {
    if (this.status === 'Open') {
      window.location.href = this.data.checkout.paymentUrl;
    }
    router.navigate(`/${window.location.search}`);
  }

  onClickFirstButton() {
    router.navigate(`/`);
  }

  get firstButtonText() {
    return '';
  }

  get secondButtonText() {
    return '';
  }
}

window.customElements.define('order-status-section', OrderStatusSection);

class PrepareDownloadSection extends Section {
  constructor() {
    super();
    window.addEventListener('mapUrl', this.handleMapUrlChange.bind(this));
    this.pdfFile = '';
  }

  handleMapUrlChange(event) {
    if (event.detail.state === 'LOADING') {
      this.pdfFile = 'LOADING';
    }
    if (event.detail.state === 'SUCCESS') {
      this.pdfFile = event.detail.data.fileLink;
      if (this.checkoutWhenPdfFileIsReady) {
        this.stripeCheckout();
      }
    }
  }

  onClickSecondButton() {
    if (this.pdfFile === 'LOADING') {
      this.checkoutWhenPdfFileIsReady = true;
      this.inputElements.innerHTML = /* html */ `<spinning-world></spinning-world>`;
    } else {
      this.stripeCheckout();
    }
  }

  get sectionRoute() {
    return '/prepare-download';
  }

  stripeCheckout() {
    stripeCheckout(this.pdfFile);
  }

  onClickFirstButton() {
    router.navigate(`/${window.location.search}`);
  }

  get firstButtonText() {
    return 'Back';
  }

  get secondButtonText() {
    return 'Checkout €5';
  }
}

window.customElements.define(
  'prepare-download-section',
  PrepareDownloadSection
);

class DownloadSuccess extends Section {
  get sectionRoute() {
    return '/download-success';
  }

  async handleExtraOpenSection() {
    document
      .querySelector('#downloadLink')
      .setAttribute('href', initialUrl.searchParams.get('pdfFile'));
  }

  onClickSecondButton() {
    router.navigate(`/${window.location.search}`);
  }

  onClickFirstButton() {
    router.navigate(`/`);
  }

  get firstButtonText() {
    return 'New map';
  }

  get secondButtonText() {
    return 'Same map';
  }
}

window.customElements.define('download-success-section', DownloadSuccess);

class DownloadFail extends Section {
  get sectionRoute() {
    return '/download-fail';
  }

  onClickSecondButton() {
    router.navigate(`/${window.location.search}`);
  }

  onClickFirstButton() {
    router.navigate(`/${window.location.search}`);
  }

  get firstButtonText() {
    return 'New map';
  }

  get secondButtonText() {
    return 'Try again';
  }
}

window.customElements.define('download-fail-section', DownloadFail);
