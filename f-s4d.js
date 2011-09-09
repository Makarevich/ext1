
console.log('Running s4d fetcher');

// request tab url
chrome.tabs.getSelected(null, function(tab){
    check_url(tab.url);
});

function check_url(url){
    var checker = /^http:\/\/www.scholars4dev.com\//;

    if(!checker.test(url)){
        console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
        return;
    }

    jQuery.get(url).done(parse_first_page);
}

function parse_first_page(page_text){
    docroot.innerHTML = page_text;

    console.log(
    $('div#content > div > div.maincontent > div.post', docroot).size()
    );

}

