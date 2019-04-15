const request = require('request').defaults({ jar: true });
request.post('http://localhost:7001/backstage/service', {}, (error, response, body) => {
  console.log(body);
});