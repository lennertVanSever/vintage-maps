import { dispatchCustomEvent } from './event';

const initialUrl = new URL(window.location.href);
export const isLocalHost = initialUrl.hostname === 'localhost';

export function addParameterToURL(key, value) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set(key, value);
  window.history.replaceState({}, '', newUrl.href);
  dispatchCustomEvent('updateUrlSearchQuery');
}

export function addParametersToURL(data) {
  const newUrl = new URL(window.location.href);
  Object.keys(data).forEach(key => {
    const value = data[key];
    newUrl.searchParams.set(key, value);
  });
  window.history.replaceState({}, '', newUrl.href);
  dispatchCustomEvent('updateUrlSearchQuery');
}

export const getUrlParameter = key => {
  const currentUrl = new URL(window.location.href);
  return currentUrl.searchParams.get(key);
};
