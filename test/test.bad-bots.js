const tap = require('tap');
const Hapi = require('@hapi/hapi');
const badBots = require('../index.js');

tap.test('plugin should initialize with defaults', async t => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.route({
    method: 'GET',
    path: '/goodroute',
    handler () {
      return '<b>Good Route</b>';
    }
  });

  await server.register(badBots);

  await server.start();

  const res1 = await server.inject({
    method: 'get',
    url: '/goodroute'
  });

  t.equal(res1.statusCode, 200, 'Normal route not touched');

  const res2 = await server.inject({
    method: 'get',
    url: '/bad.php'
  });

  t.equal(res2.statusCode, 404, 'Bad route has correct status code');
  t.equal(res2.payload, 'not found', 'Plain body returned');

  await server.stop();
  t.end();
});

tap.test('Returns html is Accept = html but plain otherwise', async t => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    const resp = h
      .response('<h1>There was an error</h1>')
      .code(response.output.statusCode);

    resp._error = {
      stack: null,
      data: response.data,
      output: response.output
    };

    return resp;
  });

  await server.register(badBots);

  await server.start();

  const res1 = await server.inject({
    method: 'get',
    url: '/notfound.php',
    headers: {
      accept: 'html'
    }
  });

  t.equal(res1.statusCode, 404, 'Correct status code');
  t.equal(res1.payload, '<h1>There was an error</h1>', 'html returned');

  const res2 = await server.inject({
    method: 'get',
    url: '/notfound.php'
  });

  t.equal(res2.statusCode, 404, 'Correct status code');
  t.equal(res2.payload, 'not found', 'Plain body returned');

  await server.stop();
  t.end();
});

tap.test('Handles user agent rules', async t => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    const resp = h
      .response('<h1>There was an error</h1>')
      .code(response.output.statusCode);

    resp._error = {
      stack: null,
      data: response.data,
      output: response.output
    };

    return resp;
  });

  await server.register(badBots);

  await server.start();

  const res1 = await server.inject({
    method: 'get',
    url: '/notfound',
    headers: {
      accept: 'html',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
    }
  });

  t.equal(res1.statusCode, 404, 'Correct status code');
  t.equal(res1.payload, '<h1>There was an error</h1>', 'html returned');

  const res2 = await server.inject({
    method: 'get',
    url: '/notfound',
    headers: {
      'user-agent': 'MJ12bot'
    }
  });

  t.equal(res2.statusCode, 404, 'Correct status code');
  t.equal(res2.payload, 'not found', 'Plain body returned');

  await server.stop();
  t.end();
});

tap.test('Disable rules', async t => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    const resp = h
      .response('<h1>There was an error</h1>')
      .code(response.output.statusCode);

    resp._error = {
      stack: null,
      data: response.data,
      output: response.output
    };

    return resp;
  });

  await server.register({
    plugin: badBots,
    options: {
      routeRules: false,
      userAgentRules: false
    }
  });

  await server.start();

  const res1 = await server.inject({
    method: 'get',
    url: '/notfound.php'
  });

  t.equal(res1.statusCode, 404, 'Correct status code');
  t.equal(res1.payload, '<h1>There was an error</h1>', 'html returned');

  const res2 = await server.inject({
    method: 'get',
    url: '/notfound.php',
    headers: {
      'user-agent': 'MJ12bot'
    }
  });

  t.equal(res2.statusCode, 404, 'Correct status code');
  t.equal(res2.payload, '<h1>There was an error</h1>', 'html returned');

  await server.stop();
  t.end();
});
