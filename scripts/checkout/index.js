import sha1 from 'js-sha1';
import { v4 as uuid } from 'uuid';

export const getFileName = () => {
  return `map-${uuid()}.pdf`;
};

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

export const getUploadUrl = async () => {
  const responseRaw = await fetch(
    'https://vintage-maps-functions.netlify.app/.netlify/functions/authorize_backblaze'
  );
  const response = await responseRaw.json();
  return response;
};

export const uploadFile = async ({
  contentType = 'text/plain',
  content = 'test',
  fileName = 'test3.txt',
}) => {
  const { authorizationToken: Authorization, uploadUrl } = await getUploadUrl();
  const responseRaw = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization,
      'X-Bz-File-Name': fileName,
      'X-Bz-Content-Sha1': sha1(content),
      'Content-Type': contentType,
    },
    body: content,
    redirect: 'follow',
  });

  const response = await responseRaw.json();
  if (response.fileName) {
    return `https://f000.backblazeb2.com/file/map-prints/${response.fileName}`;
  }
  return response;
};
