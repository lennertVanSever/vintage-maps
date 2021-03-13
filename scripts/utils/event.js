export const dispatchCustomEvent = (eventName, detail) => {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail,
    })
  );
};
