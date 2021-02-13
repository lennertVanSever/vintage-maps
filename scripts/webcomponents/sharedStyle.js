export const labelStyleRaw = `
  width: 100%;
  display: block;
  margin: var(--margin-6) 0px;
`;
export const labelStyle = `
  label {
    ${labelStyleRaw}
  }
  #hint {
    font-size: 12px;
    font-style: italic;
  }
`;

export const formElementStyle = `
  appearance:none; -moz-appearance:none; -webkit-appearance: none;
  border-radius: 0px;
  font-size: 14px;
  display: block;
  margin-top: var(--margin-2);
  padding: var(--margin-3);
  background-color: var(--body-color);
  width: 100%;
  color: var(--black);
  border: 1px solid var(--black);
  box-sizing: border-box;
`;

// https://gist.github.com/MoOx/9137295
export const resetButton = `
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;

  background: transparent;

  color: inherit;
  font: inherit;

  line-height: normal;

  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;

  -webkit-appearance: none;
`;
