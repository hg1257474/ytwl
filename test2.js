const a = require("http");
const data = encodeURI(`username=dsadasd&password=dsdsds的撒打算ds`);
//const data="ds"
let datas=""
const q=a.request(
  "http://localhost:7001/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  },
  res=>{
      res.on("error",(err)=>console.log(err))
      res.on("data",chunk=>datas+=chunk)
      res.on("end",()=>console.log(datas))
  }
);
q.end(data);
