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

  server.ext('onPreResponse', (request, h) => {
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
      const response = h.response('not found');
      response.type('text/plain');
      response.code(404);
      response.takeover();
      return response;
    }

    return h.continue;
  });
};

export const plugin = {
  once: true,
  pkg: require('./package.json'),
  register
};
