/* eslint-disable babel/no-unused-expressions */
/* eslint-disable promise/no-nesting */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import {
  fillInDetailParameters,
  fillInHeaderParameters,
  getByDataCy,
  getElementInsideShadow,
  similarityStrings,
} from '../utils/index';

let downloadedPdfUrl;
const newTitle = 'title typed by cypress';
describe('Make and Download South America 1783 map', () => {
  before(() => {
    const positionOfSouthAmerica =
      'k=1.641255453306849&x=195.69931656305133&y=44.75427514254045';
    cy.visit(`/?${positionOfSouthAmerica}`);
  });
  it('Change other top parameters', () => {
    fillInHeaderParameters({
      title: newTitle,
      year: '1783',
      language: 'es',
      color: 'schoolColors',
      direction: 'portrait',
    });
  });

  it('open more editing options and select some parameters', () => {
    fillInDetailParameters({
      projection: 'Mercator',
      font: 'Open+Sans',
      borderWidth: 50,
      citySize: 7,
      graticuleGapSize: 20,
      graticuleLineSize: 6,
    });
  });

  it('the title should still be the same', () => {
    getByDataCy('titleMap').should('have.text', newTitle);
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
    cy.log(downloadedPdfUrl);
    cy.log(Cypress.env('controlPdf'));
    cy.request(Cypress.env('controlPdf')).then(controlPdfRaw => {
      cy.request(downloadedPdfUrl).then(newPdfRaw => {
        const controlPdf = removeDateRelatedText(controlPdfRaw.body);
        const newPdf = removeDateRelatedText(newPdfRaw.body);
        assert.isAbove(
          Number(similarityStrings(controlPdf, newPdf)),
          90,
          'At least 90% similarity'
        );
      });
    });
  });

  it('Fake a valid purchase', () => {
    cy.intercept('**/pay-downloaded-map', {
      body: {
        failedByCypress: true,
      },
      statusCode: 500,
    }).as('pay');
    getElementInsideShadow('prepare-download-section', 'secondButton').click();
    cy.wait('@pay').then(({ request }) => {
      const { origin, searchParameters } = request.body;
      cy.visit(`${origin}/download-success${searchParameters}`);
      cy.contains('Payment complete');
      getByDataCy('downloadLink').should('have.attr', 'href', downloadedPdfUrl);
    });
  });
});
