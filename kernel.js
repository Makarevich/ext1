
/* ==== browser action ==== */
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('You pressed browser action');
});

/* ==== local storage iface ==== */
/*
chrome.extension.onRequest.addListener(function(req, sender, respond){
    if(req.store_key && req.store_data){
        var prev = localStorage[req.store_key];
        localStorage[req.store_key] = req.store_data;
        respond(prev);
    }else if(req.fetch_key){
        respond(localStorage[req.fetch_key]);
    }
});
*/

/* ==== ajax initialization === */
(function(){
    // setup default type and default error handler
    jQuery.ajaxSetup({
        dataType:       "text",
        error:          ajax_error
    });

    function ajax_error(xhr, text, err){
        console.error('ajax error: ' + text + '/' + err);
    }
})();


/* ==== console API ==== */
function run(name, key){
    if(key){
        data_key1 = key;
    }

    jQuery.getScript(name.toString() + '.js');
}

function display(key){
    var current_tab;

    chrome.extension.onRequest.addListener(listen);

    chrome.tabs.create({
        url: chrome.extension.getURL('display.html')
    }, function(tab){
        current_tab = tab;
    });

    function listen(req, sender, respond){
        if(req != 'ready'){
            return;
        }

        if(sender.tab.id != current_tab.id){
            return;
        }

        respond({
            key:    key,
            data:   localStorage[key]
        });
    }
}
