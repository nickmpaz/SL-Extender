//on install, set pipeline as a default surfbreak
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get('sURL', function(data){
    if (typeof data.sURL === "undefined") {
      chrome.storage.sync.set({sURL: ["https://www.surfline.com/surf-report/pipeline/5842041f4e65fad6a7708890","https://www.surfline.com/surf-report/blacks/5842041f4e65fad6a770883b","https://www.surfline.com/surf-report/el-porto/5842041f4e65fad6a7708906"]}, function() {
        console.log('sURL set to pipeline');
      });
    }
  });
})



