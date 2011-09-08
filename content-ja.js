
console.log('content script for ya.ru');

chrome.extension.sendRequest({
    store_key:  "current url",
    store_data: document.location.href
}, function(resp){
    console.log("Previous data: " + resp.toString());
});

