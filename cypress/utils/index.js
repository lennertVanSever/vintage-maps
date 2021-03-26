export const getByDataCy = key => cy.get(`[data-cy=${key}]`);
export const getElementInsideShadow = (shadowElement, elementKey) =>
  cy.get(shadowElement).shadow().find(`[data-cy=${elementKey}]`);
