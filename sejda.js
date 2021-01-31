/* eslint-disable */

window.SejdaJsApi = (function () {
  return (
    (this.htmlToPdf = function (opts) {
      function sendXhrRequest(callback) {
        const xhr = new XMLHttpRequest();
        if (!('withCredentials' in xhr)) {
          const err = new Error('CORS is not supported by the browser');
          return console.error(err.message), callback(err);
        }
        (xhr.onload = function (e) {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              opts.getResponse(xhr.response)
              return callback(null, xhr.response);
            }
            
            const error = new Error(`Status code: ${xhr.status}`);
            return (error.statusCode = xhr.status), callback(error, xhr);
          }
        }),
          (xhr.onerror = function (err) {
            callback(err);
          }),
          xhr.open('POST', 'https://api.sejda.com/v2/html-pdf'),
          xhr.setRequestHeader('Content-Type', 'application/json'),
          publishableKey &&
            (xhr.setRequestHeader('Authorization', `Token: ${publishableKey}`),
            (xhr.withCredentials = !0)),
          (xhr.responseType = 'arraybuffer'),
          xhr.send(JSON.stringify(data));
      }
      function retry(times, waitSeconds, fn, callback) {
        fn(function (err) {
          if (err) {
            if (times <= 0) return callback(err);
            const message = err.message || '';
            return (
              console.log(
                `Failed: ${message}. Waiting ${waitSeconds} seconds and then retrying...`
              ),
              setTimeout(function () {
                retry(times - 1, 2 * waitSeconds, fn, callback);
              }, 1e3 * waitSeconds)
            );
          }
          return callback();
        });
      }
      (opts.success = opts.success || function () {}),
        (opts.error = opts.error || function () {}),
        (opts.always = opts.always || function () {}),
        opts.retries === !1 || opts.retries === 0
          ? (opts.retries = 0)
          : (opts.retries = opts.retries || 5);
      var { publishableKey } = opts;
      if (publishableKey && publishableKey.indexOf('api_public_') !== 0) {
        const err = new Error(
          'Your publishable key looks incorrect, should start with: api_public_'
        );
        return console.error(err.message), opts.error(err), void opts.always();
      }
      var data = { type: 'htmlToPdf' };
      [
        'url',
        'htmlCode',
        'pageSize',
        'pageOrientation',
        'viewportWidth',
        'pageMargin',
        'pageMarginUnits',
        'hideNotices',
        'usePrintMedia',
        'delay',
      ].forEach(function (field) {
        typeof opts[field] !== 'undefined' && (data[field] = opts[field]);
      }),
        data.url ||
          data.htmlCode ||
          (data.htmlCode = document.querySelector('html').innerHTML),
        retry(opts.retries, 2, sendXhrRequest, function (err, response) {
          err ? opts.error(err) : opts.success(response), opts.always();
        });
    }),
    this
  );
})();
