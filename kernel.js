
/* ==== browser action ==== */
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('You pressed browser action');
});

/* ==== local storage iface ==== */
chrome.extension.onRequest.addListener(function(req, sender, respond){
    if(req.store_key && req.store_data){
        var prev = localStorage[req.store_key];
        localStorage[req.store_key] = req.store_data;
        respond(prev);
    }else if(req.fetch_key){
        respond(localStorage[req.fetch_key]);
    }else{
        respond();
    }
});


/* ==== console API ==== */
function inject(name){
    chrome.tabs.executeScript(null, {
        file: 'api.js'
    }, function(){
        chrome.tabs.executeScript(null, {
            file: name.toString() + '.js'
        });
    });
}

function open_view (url){
    chrome.tabs.create({
        url: chrome.extension.getURL(url + '.html')
    });
}

