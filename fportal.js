
(function () {

    var base_url;           // base fetching url

    var query_length;

    var page_cur;
    var page_total;

    var posts_data = [];

    console.log('Running fportal fetcher');

    // start the process
    check_url(data_key1);

    function fetch_url(url, cb){
        console.log('Requesting ' + url + ' ...');
        jQuery.get(url).done(cb);
    }

    function check_url(url){
        var checker = /^http:\/\/www\.scholarshipportal\.eu\//;

        // check url
        if(!checker.test(url)){
            console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
            return;
        }

        // 
        if(!/\&start=0($|\&)/.test(url)){
            console.error("Page urls are dissallowed");
            return;
        }

        base_url = url;

        base_url.replace('&start=0', '');

        // request the page
        fetch_url(url, parse_paginator);
    }

    function parse_paginator(html){
        docroot.innerHTML = html;

        // === parse paginator text ===
        //var content = $('div#PageContainer div#PagingPlaceholder > div.PagingContainer > ul.Paging > li > a', docroot);
        var content = $('div.PagingContainer > ul.Paging > li > a', docroot);

        console.assert(content.length > 0, "content length <= 0");

        var content = content.map(function(i, dom){
            return $(this).attr('href');
        }).get();

        var starts = jQuery.map(content, function(h){
            var m = h.match(/&start=(\d+)/);
            console.assert(m, "could not parse a paginator start");
            return Number(m[1]);
        });

        var lengths = jQuery.map(content, function(h){
            var m = h.match(/&length=(\d+)/);
            console.assert(m, 'couldnot parse a paginator end');
            return Number(m[1]);
        });

        var min, max, len;

        min = max = starts.shift();
        len = lengths.shift();

        jQuery.each(lengths, function(i, val){
            console.assert(val == len, 'paginator lengths are unequal');
        });

        jQuery.each(starts, function(i, val){
            if(min > val) min = val;
            if(max < val) max = val;
        });

        console.assert(min == 0, 'paginator min != 0');

        query_length = len;

        page_cur   = 1;
        page_total = (max / len) + 1;

        console.log('Page ' + page_cur + '/' + page_total + '(len: ' + query_length + ')');

        parse_posts(html);
    }

    function request_next_page(){
        if(page_cur > 2){               // FIXME
            store_posts();
            return;
        }

        var url = base_url;
        if(page_cur > 1) url += '?start=' + ((page_cur - 1) * query_length).toString();

        fetch_url(url, parse_posts);
    }

    function parse_posts(html){
        docroot.innerHTML = html;

        var posts = $('div.spResults > ol.ResultsList > li.ResultItem', docroot);

        [].push.apply(posts_data,
            posts.map(function(i, dom){
                var tds = $("div.ResultItemContent > table.ScholarshipExtraInfo " + 
                    "tr > td:last-child", this);

                return {
                    href:       'http://www.scholarshipportal.eu/' + $("h2 > a", this).attr('href'),
                    title:      $("h2 > a", this).text(),
                    text:       $("div.ResultItemContent > p.Description", this).text(),
                    levels:     tds.eq(0).text(),
                    duration:   tds.eq(1).text(),
                    amount:     tds.eq(2).text()
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

})();
