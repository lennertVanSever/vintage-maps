/* eslint-disable promise/no-nesting */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import { getByDataCy, getElementInsideShadow } from '../utils/index';

// const downloadedPdfUrl =
//   'https://f000.backblazeb2.com/file/map-prints/map-95bedfb9-ee8e-4022-a85a-828c95608eca.pdf';

let downloadedPdfUrl;
describe('Make and Download South America 1783 map', () => {
  before(() => {
    const positionOfSouthAmerica =
      'k=1.641255453306849&x=195.69931656305133&y=44.75427514254045';
    cy.visit(`/?${positionOfSouthAmerica}`);
  });
  it('The title input should change the map title', () => {
    const newTitle = 'title typed by cypress';
    getElementInsideShadow('title-input', 'titleInput')
      .clear('')
      .type(newTitle, { force: true });

    getByDataCy('titleMap').should('have.text', newTitle);
  });
  it('Change other top parameters', () => {
    getElementInsideShadow('year-select', 'select').select('1783');
    getElementInsideShadow('language-select', 'select').select('es');
    getElementInsideShadow('radio-map-style', 'radio').check('schoolColors', {
      force: true,
    });
    getElementInsideShadow('radio-map-direction', 'radio').check('portrait', {
      force: true,
    });
  });
  it('open more editing options and select some parameters', () => {
    getElementInsideShadow('expand-content', 'expandContentButton').click();
    getElementInsideShadow('projection-select', 'select').select('Mercator');
    getElementInsideShadow('font-select', 'select').select('Open+Sans');
    getElementInsideShadow('font-select', 'select').select('Open+Sans');

    [
      {
        shadowCy: 'borderWidth',
        value: 50,
      },
      {
        shadowCy: 'citySize',
        value: 7,
      },
      {
        shadowCy: 'graticuleGapSize',
        value: 20,
      },
      {
        shadowCy: 'graticuleLineSize',
        value: 6,
      },
    ].forEach(({ shadowCy, value }) => {
      getElementInsideShadow(`[data-cy=${shadowCy}]`, 'range')
        .invoke('val', value)
        .trigger('input');
    });
  });

  it('Do download checkout', () => {
    cy.intercept({
      method: 'POST',
      url: '/upload_map',
    }).as('uploadMap');

    getElementInsideShadow('customize-section', 'firstButton').click();
    cy.wait('@uploadMap').then(interception => {
      downloadedPdfUrl = interception.response.body.fileLink;
      expect(downloadedPdfUrl).to.match(
        /^https:\/\/f000.backblazeb2.com\/file\/map-prints\/map.+.pdf$/
      );
    });
  });

  it('Check if the pdf is the same as the control pdf', () => {
    const removeDateRelatedText = input => {
      return input.replace(/\/CreationDate.+\n\/.+\n/, '');
    };
    cy.request(Cypress.env('controlPdf')).then(controlPdfRaw => {
      cy.request(downloadedPdfUrl).then(newPdfRaw => {
        const controlPdf = removeDateRelatedText(controlPdfRaw.body);
        const newPdf = removeDateRelatedText(newPdfRaw.body);
        cy.log('pdfs are the same', controlPdf === newPdf);
      });
    });
  });
});
