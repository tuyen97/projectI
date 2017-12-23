var express = require("express");
var app = express();
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

var link = [];
function fun(){
  this.title ="";
  this.img ="";
  this.body = "";
  return this;
}
var url = "https://vnexpress.net/tin-tuc/cuoi";
var list = fs.readFileSync("link.txt","utf8");
list = JSON.parse(list);


request(url, function (err, response, body) {
  if (!err && response.statusCode == 200) {
    var $ = cheerio.load(body);
    var d = $(body).find(".list_funny a");
    fs.writeFileSync("link.txt", "");
    d.each(function (i, e) {
      //link.push(e["attribs"]["href"]);
      //link[i] = e["attribs"]["href"];
      request(e["attribs"]["href"], function (err, response, body) {
        if (!err && response.statusCode == 200) {
          var $ = cheerio.load(body);
          var f = new fun();
          f.title = $(".title_news_detail").text();
          f.img = $(".tplCaption img").attr("src");
          var ds = $(body).find(".description");
          ds.each(function (i, e) {
            if (i == 0) {
              f.body = $(this).text();
            }
          });
          f.body += $(".content_detail").text();
        }
        else console.log('Error');
        link.push(f);
        fs.writeFileSync("link.txt",JSON.stringify(link));
      });
    });
  }
  else console.log('Error');
});


// var a = fs.readFileSync("link.txt", "utf8");
// a = JSON.parse(a);
// console.log(a.length);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(8000);

io.on("connection", function (socket) {
  console.log(socket.id + " da ket noi");
  socket.on("disconnect", function () {
    console.log(socket.id + " da ngat ket noi");
  });

   socket.on("client", function (data) {
     socket.emit("fun", list[data]);
     console.log(data);
   });
 
   var i = Math.floor((Math.random() * list.length) + 1);
  // console.log(list[5].body);
  // //console.log(list[i]);
   socket.emit("length", list.length);
   socket.emit("fun", list[i]);
  //console.log(fun.body);
});
app.get("/", function (req, res) {
  res.render("trangchu");

});
