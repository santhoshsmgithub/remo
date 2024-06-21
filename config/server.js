module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://localhost:1337',
  //url: 'https://api.socit.org',
  //url:'https://api.rotaryeyecare.org',
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  strapilocalurl: env('STRAPI_LOCAL_URL', 'http://localhost:1337'),
  proxy: env.bool('IS_PROXIED', true),

  app: {
    keys: env.array('APP_KEYS'),
  },
});
