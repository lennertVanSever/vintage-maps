import { resetAlreadySelected } from '../map/utils.js';
import { ShadowElement } from './shadowElement.js';

class SidePanel extends ShadowElement {
  constructor() {
    super();
    window.history.replaceState = this.historyChange.bind(this, 'replaceState');
    window.history.pushState = this.historyChange.bind(this, 'pushState');
    window.onpopstate = event =>
      this.historyChange(
        null,
        event.state,
        '',
        event.target.location.href
      ).bind(this);
    this.shadowRoot.getElementById('closeButton').onclick = this.close.bind(
      this
    );
    document.body.onclick = this.close.bind(this);
    this.shadowRoot.getElementById('section').onclick = event => {
      event.stopPropagation();
    };
  }

  async historyChange(historyFunction, data, title, urlString) {
    const url = new URL(urlString);
    this.info = url.searchParams.get('info');
    this.type = url.searchParams.get('type');
    if (historyFunction)
      History.prototype[historyFunction].apply(window.history, [
        data,
        title,
        urlString,
      ]);
    this.loadData();
  }

  async loadData() {
    if (this.info && this.type) {
      this.shadowRoot.getElementById('section').classList.add('loading');
      this.shadowRoot.getElementById('section').classList.remove('closed');

      const emptyImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
      this.shadowRoot.getElementById('img').src = emptyImage;

      this.wikipediaTitle = await this.getWikipediaTitle();
      await this.getWikipediaContent();
      this.bindData();
    }
  }

  bindData() {
    this.shadowRoot.getElementById('section').classList.remove('loading');
    this.shadowRoot.getElementById(
      'paragraph'
    ).innerText = this.wikiData.extract;
    this.shadowRoot.getElementById(
      'img'
    ).src = this.wikiData.originalimage.source;
    this.shadowRoot.getElementById(
      'title'
    ).innerText = this.wikiData.displaytitle;
    this.shadowRoot.getElementById(
      'link'
    ).href = this.wikiData.content_urls.desktop.page;
  }

  async getWikipediaTitle() {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${this.info}&utf8=&format=json&prop=extracts&exintro&origin=*`;
    try {
      const responseRaw = await fetch(url);
      const response = await responseRaw.json();
      return response.query.search[0].title;
    } catch (e) {
      console.log(e);
    }
  }

  async getWikipediaContent() {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${this.wikipediaTitle}`;
    try {
      const responseRaw = await fetch(url);
      const response = await responseRaw.json();
      this.wikiData = response;
    } catch (e) {
      console.log(e);
    }
  }

  close() {
    resetAlreadySelected();
    const url = new URL(window.location.href);
    url.searchParams.delete('info');
    url.searchParams.delete('type');
    window.history.pushState({}, '', url.href);
    this.shadowRoot.getElementById('section').classList.add('closed');
  }

  get htmlString() {
    return /* html */ `
      <style>
        @keyframes shimmer {
          0%{
            background-position: -450px 0;
          }
          100%{
            background-position: 450px 0;
          }
        }
        .loadingAnimation {
          display: none;
          width: 50px;
          position: absolute;
          left: 0;
          right: 0;
          top: 50px;
          margin: auto;
        }
        .loading #content {
          display: none;
        } 
        .loading .loadingAnimation {
          display: block;
        }
        .closed {
          top: 100vh
        }
        section {
          top: 40vh;
          height: 60vh;
          width: 100%;
          position: absolute;
          transition: left 0.1s;
          background-color: white;
          z-index: 2;
          overflow: auto;
        }
        img {
          width: 100%;
        }
        #textContent {
          padding: 0px 30px;
          padding-bottom: var(--margin-6);
        }
        #closeButton {
          position: absolute;
          width: 30px;
          height: 30px;
          border: none;
          background-color: rgba(0%, 0%, 0%, 50%);
          border-radius: 50%;
          right: 7px;
          top: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #closeButton img {
          width: 12px;
          height: 12px;
        }
        #closeButton:hover, #closeButton:focus {
          background-color: black;
        }
        @media only screen and (min-width: 600px) {
          .closed {
            left: -400px;
          }
          section {
            max-width: 400px;
            left: 0px;
            height: 100vh;
            width: calc(100% - var(--margin-6));
            top: 0;
          }
        }
      </style>
      <section class="closed" id="section">
        <button id="closeButton"><img src="icons/cross.svg"/></button>
        <div id="content">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Leptis_Magna_Arch_of_Septimus_Severus.jpg/213px-Leptis_Magna_Arch_of_Septimus_Severus.jpg" id="img" />
          <div id="textContent">
            <h2 id="title">title</h2>
            <p id="paragraph">paragraph</p>
            <a id="link" href="#">Read more on wikipedia</a>
          </div>
        </div>
        <img src="/icons/loader.svg" class="loadingAnimation" />
      </section>
    `;
  }
}

window.customElements.define('side-panel', SidePanel);
