import config from 'config';
import httpContext from 'universal-express-http-context';

let pino = null;
if (process.env.NODE_ENV === 'test') {
  // We explicitely require the "browser" (client) version of Pino to write
  // logs with `console` and not `stdout` so that Jest can handle the output.
  // See: https://github.com/mozilla/addons-frontend/issues/5869
  //
  // eslint-disable-next-line global-require
  pino = require('pino/browser');
} else {
  // Pino is an isomorphic logging library and works well on both the server
  // and the client without configuration.
  //
  // eslint-disable-next-line global-require
  pino = require('pino');
}

const pinoLogger = pino({
  level: config.get('loggingLevel'),
  name: config.get('appName'),
});

export default ['debug', 'error', 'fatal', 'info', 'trace', 'warn'].reduce(
  (decoratedLogger, level) => {
    return {
      ...decoratedLogger,
      [level]: (...args) => {
        const requestId = httpContext.get('amo-request-id');

        if (requestId) {
          pinoLogger[level]({ requestId }, ...args);
        } else {
          pinoLogger[level](...args);
        }
      },
    };
  },
  {},
);
