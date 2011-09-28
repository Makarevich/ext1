
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
function run(name){
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

function fetch_posts(url, target_key){

    var api = m.get_fetcher_api();

    var base_url;           // base fetching url
    var page_nums = null;
    var posts_data = [];

    console.log('Running ' + api.name + ' fetcher');

    // start the process
    check_url(url);

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

        base_url = url;

        // request the page
        fetch_url(url, parse_first_page);
    }

    function parse_first_page(html){
        docroot.innerHTML = html;

        page_nums = api.parse_paginator(docroot);

        if(page_nums === false){
            console.error("Cannot parse paginator");
            return;
        }

        console.log('Page ' + page_nums[0] + '/' + page_nums[1]);

        parse_posts(html);
    }

    function request_next_page(){
        if(page_nums[0] > 2){               // FIXME
            store_posts();
            return;
        }

        var url = api.get_page_url(base_url, page_nums[0]);

        fetch_url(url, parse_posts);
    }

    function parse_posts(html){
        docroot.innerHTML = html;

        var new_posts = api.parse_posts(docroot);

        console.log(posts_data);

        [].push.apply(posts_data, new_posts);

        // iterate
        page_nums[0]++;
        request_next_page();
    }

    function store_posts(){
        console.log('Parsed ' + posts_data.length + ' posts');

        localStorage[target_key] = LZW.encode(JSON.stringify(posts_data));
    }
}
