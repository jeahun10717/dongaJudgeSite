const koaSwagger = require('koa2-swagger-ui');
const yamljs = require('yamljs');
const spec = yamljs.load('./src/swagger/openapi.yaml');

module.exports = koaSwagger.koaSwagger({
  title: 'REST API DOCUMENTS',
  swaggerOptions: {
    spec
  },
  hideTopbar: true,
  routePrefix: '/api/docs'
});