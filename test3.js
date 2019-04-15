const mongoose = require("mongoose");
mongoose.connect("mongodb://huishenghuo.net/testnm,", { useNewUrlParser: true });
let Cat = new mongoose.Schema({
  name: String
});
Cat.methods.spead = function() {
  console.log(Object.keys(this));
};
let cat1 = mongoose.model("Kit", Cat);
var slie = new cat1({ name: "dsds" });
slie.spead()
console.log(slie);
slie.save()