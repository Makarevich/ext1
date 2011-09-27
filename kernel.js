
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
function run(name, key1, key2){
    if(key1) data_key1 = key1;
    if(key2) data_key2 = key2;

    jQuery.getScript(name.toString() + '.js');
}

function display(key, pattern){
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
            pat:    pattern,
            data:   localStorage[key]
        });
    }
}

function ls (pat){
    var ret = [];

    for(var i in localStorage){
        if(typeof pat == 'string' && i.indexOf(pat) != 0){
            continue;
        }
        ret.push(i);
    }

    return ret;
}

function fetch_posts(key1, key2){
    if(key1) data_key1 = key1;
    if(key2) data_key2 = key2;

    ///

    var api = m.get_posts_api();

    var base_url;           // base fetching url

    var page_cur;
    var page_total;

    var posts_data = [];

    console.log('Running ' + api.name + ' fetcher');

    // start the process
    check_url(data_key1);

    function fetch_url(url, cb){
        console.log('Requesting ' + url + ' ...');
        jQuery.get(url).done(cb);
    }

    function check_url(url){
        var patterns = api.get_url_patterns();

        // check url
        if(!patterns['checker'].test(url)){
            console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
            return;
        }

        // 
        if(patterns['pages'].test(url)){
            console.error("Page urls are dissallowed");
            return;
        }

        base_url = url

        // request the page
        fetch_url(url, parse_first_page);
    }

    /*
    function parse_first_page(html){
        docroot.innerHTML = html;

        // === parse paginator text ===
        var content = $('div#inner-content > div.item-list > ul.pager > li.pager-last > a', docroot);

        console.assert(content.length == 1);

        var href = content.attr('href');

        var m = href.match(/\?page=(\d+)/);

        if(!m){
            console.error("Cannot parse paginator href \"" + href + "\"");
            return;
        }

        page_cur   = 1;
        page_total = m[1];

        console.log('Page ' + page_cur + '/' + page_total);

        parse_posts(html);
    }

    function request_next_page(){
        if(page_cur > 2){               // FIXME
            store_posts();
            return;
        }

        var url = base_url;
        if(page_cur > 1) url += '?page=' + page_cur.toString();

        fetch_url(url, parse_posts);
    }

    function parse_posts(html){
        docroot.innerHTML = html;

        var posts = $('div#inner-content > div.node', docroot);

        [].push.apply(posts_data,
            posts.map(function(i, dom){
                return {
                    title:      'http://www.intscholarships.com' + $("h2.title > a", this).text(),
                    href:       $("h2.title > a", this).attr('href'),       // TODO: put full links
                    text:       $("div.content > p", this).text()
                };
            }).get()
        );

        console.log(posts_data);

        // iterate
        page_cur++;
        request_next_page();
    }

    function store_posts(){
        console.log('Parsed ' + posts_data.length + ' posts');

        localStorage[data_key2] = LZW.encode(JSON.stringify(posts_data));
    }

    */

}
