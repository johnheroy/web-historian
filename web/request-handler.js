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
      httpHelpers.serveAssets(res, 'index.html', 200);
    } else {
      archive.isURLArchived(urlClean,function(urlExists){
        if(urlExists){
          httpHelpers.serveArchives(res, urlClean, 200)
        } else {
          res.writeHead(404, httpHelpers.headers);
          res.end('')
        }
      });
    }
  } else if (req.method === 'POST'){

    res.writeHead(302, httpHelpers.headers);
    var buffer = [];
    req.on('data', function(chunk){
      buffer += chunk;
    });
    req.on('end', function(){
      var urlToUse= buffer.toString().slice(4);

      archive.isUrlInList(urlToUse, function(urlInList){
        if(urlInList){
          archive.isURLArchived(urlToUse, function(urlArchived){
            if (urlArchived){
              res.writeHead(200, httpHelpers.headers);
              httpHelpers.serveArchives(res, urlToUse, function(data){
                res.end(data.toString());
              });
            } else {
              res.writeHead(200, httpHelpers.headers);
              httpHelpers.serveAssets(res, 'loading.html', function(data){
                res.end(data.toString());
              });
            }
          });
        } else {
          fs.appendFile(archive.paths.list, urlToUse+'\n', function (err) {
            if (err) throw err;
            res.writeHead(200, httpHelpers.headers);
            httpHelpers.serveAssets(res, 'loading.html', function(data){
              res.end(data.toString());
            })
          });
        }
      });
    });
  }
};
