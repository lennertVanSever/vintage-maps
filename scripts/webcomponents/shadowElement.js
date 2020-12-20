const getTemplate = htmlString => {
  const template = document.createElement('template');
  template.innerHTML = htmlString;
  return template;
};

export class ShadowElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(
      getTemplate(this.htmlString).content.cloneNode(true)
    );
  }
}
