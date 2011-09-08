
console.log('content script for ya.ru');

chrome.extension.onRequest.addListener ( function (req, sender, respond){
    if(req.poke){
        console.log('Kernel poked ya.ru');
    }

    respond();
});

