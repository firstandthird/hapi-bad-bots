const defaults = {
  routeRules: [
    '.php',
    '.aspx',
    '.ashx',
    '.ico',
    '/feed',
    '/rss',
    '/null',
    '/undefined',
    '/...',
    '/true',
    '/false'
  ],
  userAgentRules: [
    'mj12bot' // Generates excessive 404s
  ]
};

const register = function(server, options) {
  const settings = Object.assign({}, defaults, options);

  server.ext('onRequest', (request, h) => {
    const userAgent = request.headers['user-agent'].toLowerCase();
    const acceptsHtml = (request.headers.accept || '').includes('html');
    let matched = false;

    if (acceptsHtml) {
      return h.continue;
    }

    if (Array.isArray(settings.routeRules)) {
      matched = settings.routeRules.find(rule => request.path.endsWith(rule));
    }

    if (!matched && Array.isArray(settings.userAgentRules)) {
      matched = settings.userAgentRules.find(rule => userAgent.includes(rule.toLowerCase()));
    }

    if (matched) {
      server.log(['hapi-bad-bots', 'blocked', 'info'], { message: 'blocked bot', path: request.path, userAgent, accept: acceptsHtml, matched });

      const res = request.raw.res;

      res.setHeader('Content-Type', 'text/plain');
      res.statusCode = 404;
      res.end('not found');

      return h.abandon;
    }

    return h.continue;
  });
};

exports.plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
