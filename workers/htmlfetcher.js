// eventually, you'll have some code here that uses the code in `archive-helpers.js`
// to actually download the urls you want to download.
var archiveHelpers = require('../helpers/archive-helpers');
var httpRequest = require('http-request');
var fs = require('fs');

archiveHelpers.readListOfUrls(function(urlList){
  urlList.forEach(function(url){
    if (url){
      httpRequest.get('http://' + url, function(err, res){
        if (err) throw err;
        if (res.code === 200){
          console.log(archiveHelpers.paths['archivedSites'] + '/' + url);
          fs.writeFile(archiveHelpers.paths['archivedSites'] + '/' + url, res.buffer.toString(), function(err){
            if (err) throw err;
            console.log('saved html for', url);
          });
        }
      });
    }
  });
  // for (var i = 0; i < urlList.length; i++){
  // }
});
