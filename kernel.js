
/* ==== browser action ==== */
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('You pressed browser action');
});

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


function assert(cond, msg){
    console.assert(cond, msg);
    if(!cond){
        throw 'Exiting';
    }
}

function glob_storage_keys(keys){
    if(typeof keys == 'string'){
        // if the key is a string, treat it as a glob pattern
        // and build the proper key list

        var pat = glob(keys);

        keys = [];

        for(var k in localStorage){
            if(pat.test(k)){
                keys.push(k);
            }
        }

        console.log('Matched keys: ' + keys.join(', '));
    }

    return keys;
}

/* ==== console API ==== */
function run(name){
    jQuery.getScript(name.toString() + '.js');
}

function display(keys, pattern){
    keys = glob_storage_keys(keys);

    assert(typeof keys == 'object' && keys.length && keys.length > 0,
        'No keys selected');

    var ids = {};

    for(var i in keys){
        chrome.extension.onRequest.addListener(listen);

        chrome.tabs.create({
            url: chrome.extension.getURL('display.html')
        }, function(tab){
            ids[ tab.id ] = true;
        });
    }

    function listen(req, sender, respond){
        if(req != 'ready'){
            return;
        }

        if(! ids[ sender.tab.id ]){
            return;
        }
        delete ids[ sender.tab.id ];

        chrome.extension.onRequest.removeListener(listen);

        var key = keys.shift();

        respond({
            key:    key,
            pat:    pattern,
            data:   localStorage[key]
        });
    }
}

function join_posts(keys, target_key){
    keys = glob_storage_keys(keys);

    assert(typeof keys == 'object' && keys.length && keys.length > 0,
        'No keys selected');

    // initialize the collection with the first data element
    var coll = LZW.decompress( localStorage[ keys[0] ] );

    // make sure 'href' field is present in the data
    assert( coll.href, "Initial data does not have a 'href' field" );

    // clear the collection
    for(var i in coll){
        coll[i] = [];
    }

    // initialize the uniqueness map
    var uni = {};

    // define a bit of counters
    var count_uni = 0;
    var count_total = 0;

    // join the other data to the collection
    for(var i in keys){
        var key = keys[i];

        // fetch another batch of data
        var data = LZW.decompress( localStorage[key] );

        // make sure the data element contains no extraneous fields
        // (with respect to already collected data)
        for(var f in data) {
            assert (coll[f],
                'Data item ' + key +
                ' contains an extraneous field: ' + f);
        }

        // make sure the new batch contains all the necessary fields
        for(var f in coll) {
            assert (data[f], 'Data item ' + key + ' lacks field: ' + f);
        }

        // merge data itemwise
        for(var j in data.href){
            ++count_total;

            // skip data with duplicate hrefs
            if(uni[ data.href[j] ]){
                continue;
            }

            uni[ data.href[j] ] = true;

            ++count_uni;

            // append the item fields to the collection
            for(var f in coll) {
                coll[f].push(data[f][j]);
            }
        }
    }

    console.log('Filtered out ' + count_uni + ' out of ' + count_total + ' posts');

    console.log('Collected data: ', coll);

    // store the collection
    localStorage[target_key] = LZW.compress( coll );
}

/*** fetching api ***/

function fetch_posts(urls){
    //
    // First, we transform various kings of args
    // into the uniform structure: array of url-key tuples.
    //

    if(typeof urls == 'object'){
        //
        // the case when 'url' is an associative array in the form of { url => key }
        //

        var u = [];

        for(var i in urls){
            u.push(i, urls[i]);
        }

        urls = u;
    }else{
        urls = [ urls, arguments[1] ];
    }

    // console.log('Url:', urls);

    ///

    var api = m.get_fetcher_api();

    console.log('Running ' + api.name + ' fetcher');

    process_url();

    function process_url(){
        if(urls.length <= 0){
            return;
        }

        var url         = urls.shift();
        var target_key  = urls.shift();

        var base_url;           // base fetching url
        var page_nums = null;
        var posts_data = {};

        // start the process
        check_url(url);

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

            base_url = (api.base_url_filter) ?
                api.base_url_filter(url) : 
                url;

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
            if(page_nums[0] > page_nums[1]){
                store_posts();
                return;
            }

            var url = api.get_page_url(base_url, page_nums[0]);

            fetch_url(url, parse_posts);
        }

        function parse_posts(html){
            docroot.innerHTML = html;

            var new_posts = api.parse_posts(docroot);

            // console.log(new_posts);

            if(new_posts.length > 0){
                if(is_object_empty(posts_data)){
                    //
                    // if the posts data is empty, initialize field arrays
                    // with a first item of new_posts
                    //
                    var item = new_posts.shift();

                    posts_data = {};
                    for(var i in item){
                        posts_data[i] = [item[i]];
                    }
                }

                for(var p in new_posts){
                    for(var i in posts_data){
                        posts_data[i].push(new_posts[p][i]);
                    }
                }
            }

            // iterate
            page_nums[0]++;
            request_next_page();

            function is_object_empty(o){
                for(var i in o) return false;
                return true;
            }
        }

        function store_posts(){
            function data_count(o){
                for(var i in o) return o[i].length;
            }

            var count = data_count(posts_data);

            console.log('Parsed ' + count + ' posts: ', posts_data);

            if(count > 0){
                localStorage[target_key] = LZW.compress(posts_data);
            }

            process_url();
        }
    }
}

function fetch_details(target, key, filter){
    var api = m.get_detail_api();

    // deal with the filter

    // TODO: decouple the filter processing algorithm
    if(filter && typeof filter == 'string'){
        filter = filter.split(/ +/);

        var fs = {};

        for(var i in filter){
            var f = filter[i];
            if(f){
                fs[ keycode.dekey(f) ] = f;
            }
        }

        // console.log("Dekeyed:", fs);

        filter = fs;
    }else{
        assert(0, 'Invalid filter passed');
    }

    // obtain the href array

    var href = LZW.decompress( localStorage[key] );
    assert(href.href, "The object of '" + key + "' has no href property")

    href = (function (hrefs){
        
        var hs = [];

        for (var k in filter){
            assert(k >= 0 && k < hrefs.length,
                "Key '" + filter[k] + "' is out of bound of the href array" +
                " (which is of length " + hrefs.length + ")");
            hs.push(hrefs[k]);
        }

        return hs;
    })(href.href);

    // initialize the data holder and start the process

    var posts_data = {};

    fetch_next_url();

    /////

    function fetch_next_url(){
        var url = href.shift();

        if(!url){
            store_details();
            return;
        }

        fetch_url(url, parse_details);
    }

    function parse_details(html){
        docroot.innerHTML = html;

        var new_item = api.parse_details(docroot);

        // console.log('new item:',new_item);

        if(is_object_empty(posts_data)){
            //
            // if the posts data is empty, initialize field arrays
            // with a first item of new_posts
            //
            posts_data = {};
            for(var i in new_item){
                posts_data[i] = [new_item[i]];
            }
        }else{
            // kind of verify the new_item
            for(var i in new_item){
                assert(posts_data[i], 
                    "Details parser returned an item '" + i + "', " +
                    "which is not present in previously collected posts_data");
            }

            for(var i in posts_data){
                assert(new_item[i], 
                    "Returned details lack an item '" + i + "', " +
                    "which is present in previously collected posts_data");

                posts_data[i].push(new_item[i]);
            }
        }

        // iterate
        fetch_next_url();

        function is_object_empty(o){
            for(var i in o) return false;
            return true;
        }
    }

    function store_details(){
        var count = (function(data){
            for(var i in data) return data[i].length;
        })(posts_data);
        
        console.log("Fetched " + count + " details:", posts_data);

        if(count > 0){
            localStorage[target] = LZW.compress(posts_data);
        }
    }
}
