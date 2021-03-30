/* eslint-disable promise/no-nesting */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-expect-in-promise */
import {
  fillInDetailParameters,
  fillInHeaderParameters,
  getElementInsideShadow,
} from '../utils/index';

describe('Make and Download South America 1783 map', () => {
  before(() => {
    const positionOfEurope =
      'k=5.160369478601591&x=-1927.7591489671572&y=588.1238434178917';
    cy.visit(`/?${positionOfEurope}`);
  });
  it('Change other top parameters', () => {
    fillInHeaderParameters({
      title: 'title typed by cypress for print',
      year: '1492',
      language: 'fr',
      color: 'darkColors',
      direction: 'landscape',
    });
  });
  it('open more editing options and select some parameters', () => {
    fillInDetailParameters({
      projection: 'Winkel3',
      font: 'Cormorant+Garamond',
      borderWidth: 10,
      citySize: 2,
      graticuleGapSize: 50,
      graticuleLineSize: 1,
    });
  });
  it('price is initially €35', () => {
    getElementInsideShadow('customize-section', 'secondButton').contains('€35');
  });
  it('price is €119.99 for 90x60 plexiglas', () => {
    getElementInsideShadow('radio-map-sizes', 'radio').check('90x60', {
      force: true,
    });
    getElementInsideShadow('radio-map-material', 'radio').check('plexiglas', {
      force: true,
    });
  });
  it('Go to order section', () => {
    cy.intercept({
      method: 'POST',
      url: '/upload_map',
    }).as('uploadMap');
    getElementInsideShadow('customize-section', 'secondButton').click();
    cy.wait('@uploadMap');
    // cy.visit(`/order`);
  });
  it('Fill in contact details', () => {
    [
      {
        name: 'email',
        value: 'jane.doe@gmail.com',
      },
      {
        name: 'name',
        value: 'jane doe',
      },
      {
        name: 'address',
        value: '123 fake street',
      },
      {
        name: 'zip',
        value: '1000',
      },
      {
        name: 'city',
        value: 'Fake town',
      },
    ].forEach(({ name, value }) => {
      cy.get(`text-input[name="${name}"]`).shadow().find(`input`).type(value, {
        delay: 0,
      });
    });
    getElementInsideShadow('country-select', 'select').select('BE');
  });
  it('Go to checkout section', () => {
    cy.intercept({
      url: 'https://test.printapi.nl/v2/orders',
    }).as('makeOrder');
    getElementInsideShadow('order-section', 'secondButton').click();
    cy.wait('@makeOrder');
  });
  it('Go to payment section', () => {
    getElementInsideShadow('checkout-section', 'secondButton').click();
  });
  it('Fail payment', () => {
    cy.get('.failure').click();
  });
  it('Try again to pay', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    getElementInsideShadow('order-status-section', 'secondButton').click({
      force: true,
    });
  });
  it('Success payment', () => {
    cy.get('.success').click();
  });
});
