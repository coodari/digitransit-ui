import { COMMIT_ID } from '../buildInfo';

function getRaven(SENTRY_DSN) {
  if (process.env.NODE_ENV === 'production') {
    /* eslint-disable global-require */
    const Raven = require('raven-js');
    Raven.addPlugin(require('raven-js/plugins/console'));
    /* eslint-enable global-require */

    Raven.config(SENTRY_DSN, {
      release: COMMIT_ID,
      stacktrace: true,
    }).install();
    return Raven;
  }
  return {
    captureMessage: console.error, // eslint-disable-line no-console
  };
}

export default getRaven;
