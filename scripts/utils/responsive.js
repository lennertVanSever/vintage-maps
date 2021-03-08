export const makeMapOrnamentsConsistentWithPrint = () => {
  const subWrapper = document.querySelector('#subWrapper');
  const title = document.querySelector('#title');
  const firstBorder = document.querySelector('#firstBorder');
  const secondBorder = document.querySelector('#secondBorder');
  const applyResponsiveAdaptions = () => {
    const widthUnit = subWrapper.clientWidth / 500;
    const heightUnit = subWrapper.clientHeight / 500;
    const subWrapperPadding = widthUnit * 4;
    subWrapper.style.padding = `${
      subWrapperPadding / 2
    }px ${subWrapperPadding}px ${subWrapperPadding}px ${subWrapperPadding}px`;
    title.style.fontSize = `${widthUnit * 10}px`;
    firstBorder.style.border = `${widthUnit * 1.5}px solid var(--black)`;
    firstBorder.style.padding = `${widthUnit * 2}px`;
    secondBorder.style.border = `${widthUnit * 0.5}px solid var(--black)`;
    if (subWrapper.clientWidth > 786) {
      // USE HEIGHT UNIT HERE!!!!
      // firstBorder.style.height = `calc(100% + ${heightUnit * 40}px)`;
    }
  };
  applyResponsiveAdaptions();
  window.addEventListener('resize', applyResponsiveAdaptions);
};
