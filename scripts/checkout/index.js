export const getMapHtml = () => {
  const subWrapper = document.getElementById('mapSection');
  const allCSS = [...document.styleSheets]
    .map(styleSheet => {
      try {
        return [...styleSheet.cssRules].map(rule => rule.cssText).join('');
      } catch (e) {
        console.error(
          'Access to stylesheet %s is denied. Ignoring...',
          styleSheet.href
        );
        return null;
      }
    })
    .filter(Boolean)
    .join('\n');
  return `
    <style>
      #subWrapper {
        position: absolute;
        left: 0px;
        right: 0px;
        margin: auto;
        margin-top: 10px;
        height: calc(100% - 50px) !important;
        width: calc(100% - 70px) !important;
        page-break-inside: avoid;
      }
      * {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      ${allCSS}
    </style>
    ${subWrapper.innerHTML}
  `;
};
