
//localStorage.kernel_data = 'kernel data';


chrome.extension.onRequest.addListener(function(req, sender, respond){
});

function inject(name){
    chrome.tabs.executeScript(null, {file: name.toString() + '.js'});
}

function open_view (url){
    chrome.tabs.create({
        url: chrome.extension.getURL(url)
    });
}

