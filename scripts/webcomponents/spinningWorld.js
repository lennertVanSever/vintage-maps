import { ShadowElement } from './shadowElement.js';

class SpinningWorld extends ShadowElement {
  get htmlString() {
    return /* html */ `
      <img style="position: absolute; left: 0; right: 0; top: 0; margin: auto; margin-top: 20px;" id="#loading"
      src="./loading.svg" />
     `;
  }
}

window.customElements.define('spinning-world', SpinningWorld);
