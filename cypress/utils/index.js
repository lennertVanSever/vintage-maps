export const getByDataCy = key => cy.get(`[data-cy=${key}]`);
export const getElementInsideShadow = (shadowElement, elementKey) =>
  cy.get(shadowElement).shadow().find(`[data-cy=${elementKey}]`);

export const fillInHeaderParameters = ({
  title,
  year,
  language,
  color,
  direction,
}) => {
  getElementInsideShadow('title-input', 'titleInput')
    .clear('')
    .type(title, { force: true })
    .trigger('change');

  getElementInsideShadow('year-select', 'select').select(year);
  getElementInsideShadow('language-select', 'select').select(language);
  getElementInsideShadow('radio-map-style', 'radio').check(color, {
    force: true,
  });
  getElementInsideShadow('radio-map-direction', 'radio').check(direction, {
    force: true,
  });
};

export const fillInDetailParameters = ({
  projection,
  font,
  borderWidth,
  citySize,
  graticuleGapSize,
  graticuleLineSize,
}) => {
  getElementInsideShadow('expand-content', 'expandContentButton').click();
  getElementInsideShadow('projection-select', 'select').select(projection);
  getElementInsideShadow('font-select', 'select').select(font);

  [
    {
      shadowCy: 'borderWidth',
      value: borderWidth,
    },
    {
      shadowCy: 'citySize',
      value: citySize,
    },
    {
      shadowCy: 'graticuleGapSize',
      value: graticuleGapSize,
    },
    {
      shadowCy: 'graticuleLineSize',
      value: graticuleLineSize,
    },
  ].forEach(({ shadowCy, value }) => {
    getElementInsideShadow(`[data-cy=${shadowCy}]`, 'range')
      .invoke('val', value)
      .trigger('input');
  });
};

export function similarityStrings(a, b) {
  // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
  let equivalency = 0;
  const minLength = a.length > b.length ? b.length : a.length;
  const maxLength = a.length < b.length ? b.length : a.length;
  for (let i = 0; i < minLength; i++) {
    if (a[i] === b[i]) {
      equivalency++;
    }
  }

  const weight = equivalency / maxLength;
  return `${weight * 100}`;
}
