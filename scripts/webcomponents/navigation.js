import { ShadowElement } from './shadowElement.js';

class NavigationElement extends ShadowElement {
  constructor() {
    super();
    window.addEventListener(
      'updateUrlSearchQuery',
      this.updateUrlSearchQuery.bind(this)
    );
  }

  get isActive() {
    return window.location.pathname === this.href;
  }

  updateUrlSearchQuery() {
    this.shadowRoot
      .querySelector('a')
      .setAttribute('href', this.hrefWithQueryParameters);
  }

  get href() {
    return this.getAttribute('href');
  }

  get hrefWithQueryParameters() {
    return `${this.href}${window.location.search}`;
  }

  get htmlString() {
    return /* html */ `
      <style>
        a {
          color: var(--body);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .active {
          text-decoration: underline;
          font-weight: bold;
        }
        @media only screen and (min-width:768px) {
          a {
            margin: 0px var(--margin-8);

          }
        }
      </style>
      <a href="${this.hrefWithQueryParameters}" class="${
      this.isActive ? 'active' : ''
    }">
        <slot></slot>
      </a>
     `;
  }
}

window.customElements.define('navigation-element', NavigationElement);

class NavigationHeader extends ShadowElement {
  get htmlString() {
    return /* html */ `
      <style>
        header {
          background-color: var(--black);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 16px;
          padding: var(--margin-2) 0px;
          display: flex;
          justify-content: space-around;
          box-sizing: border-box;
        }
        @media only screen and (min-width:768px) {
          header {
            justify-content: normal;
            padding-left: calc(var(--margin-8) / 2);
          }
        }
      </style>
      <header>
        <navigation-element href="/">Print</navigation-element>
        <navigation-element href="/about">About</navigation-element>
        <navigation-element href="/explore.html">Explore</navigation-element>
      </header>
     `;
  }
}

window.customElements.define('navigation-header', NavigationHeader);
