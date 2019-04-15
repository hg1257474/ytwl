const http = require("http");
const proxy = http.createServer((req, res) => {
  console.log(Object.keys(req));
  console.log(req.url);
  const url = req.url;
  res.statusCode = 200;
  const router = [[/^\/dsds/, 1]];
  router.some(value => {
    if (value[0].test(url)) res.end(value[1]);
  });
  //res.end("Tt1iyAoJkwCW57ln")
});
proxy.listen(3000);
