var httpHelpers = require('./http-helpers');
var archive     = require('../helpers/archive-helpers');
var path        = require('path');
var url         = require('url');
var fs          = require('fs');
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
              httpHelpers.serveArchives(res, urlToUse, 200);
            } else {
              httpHelpers.serveAssets(res, 'loading.html', 200);
            }
          });
        } else {
          fs.appendFile(archive.paths.list, urlToUse+'\n', function (err) {
            if (err) throw err;
            res.writeHead(200, httpHelpers.headers);
            httpHelpers.serveAssets(res, 'loading.html', 200);
          });
        }
      });
    });
  }
};
