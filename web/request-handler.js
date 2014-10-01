var fs= require('fs');
var url= require('url');
var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelpers= require('./http-helpers');
// require more modules/folders here!

exports.handleRequest = function (req, res) {
  var urlClean= url.parse(req.url).pathname.slice(1);
  if (req.method === 'GET'){
    if(url.parse(req.url).pathname==='/'){
      res.writeHead(200, httpHelpers.headers);
      httpHelpers.serveAssets(res, 'index.html', function(data){

        res.end(data.toString());
      })
    } else {
      archive.isURLArchived(urlClean,function(urlExists){
        console.log(urlExists, 'url exists for', urlClean)
        if(urlExists){
          res.writeHead(200, httpHelpers.headers);
          httpHelpers.serveArchives(res, urlClean, function(data){
            res.end(data.toString());
          })
        }else{
          res.writeHead(404, httpHelpers.headers);
          res.end('')
        }
      })
    }
  } else if (req.method === 'POST'){
    res.writeHead(302, httpHelpers.headers);
    var buffer = [];
    req.on('data', function(chunk){
      buffer += chunk;
    });
    req.on('end', function(){
      var urlToUse= buffer.toString().slice(4)
      fs.writeFile(archive.paths.list, urlToUse+'\n', function (err) {
        if (err) throw err;
        res.end(archive.paths.list);
      });
    });
  }
};
