
(function () {

    var base_url;           // base fetching url
    var initial = {};       // initial page info

    console.log('Running s4d fetcher');

    // request tab url
    chrome.tabs.getSelected(null, function(tab){
        check_url(tab.url);
    });

    function check_url(url){
        var checker = /^http:\/\/www.scholars4dev.com\//;

        // check url
        if(!checker.test(url)){
            console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
            return;
        }

        // obtain "base url"
        var m = url.match(/^(.*\/)page\/\d+.$/);
        if(m){
            base_url = m[1];
        }else{
            base_url = url;
        }

        // request the page
        jQuery.get(url).done(parse_first_page);
    }

    function parse_first_page(page_text){
        // parse the fetched html
        docroot.innerHTML = page_text;

        // === parse paginator text ===
        var content = $('div#content > div > div.maincontent', docroot);

        console.assert(content.length != 1);

        var page_text = content.find('div.wp-pagenavi > span.pages').text();

        var m = page_text.match(/Page (\d+) of (\d+)/);

        if(!m){
            console.error("Cannot parse paginator text \"" + page_text + "\"");
            return;
        }

        initial.num = m[1];
        initial.html = page_text;

        // var content = $('div#content > div > div.maincontent > div.post', docroot)

    }

})();
