
(function () {

    var base_url;           // base fetching url

    var page_cur;
    var page_total;

    var posts_data = [];

    console.log('Running ints fetcher');

    // start the process
    check_url(data_key1);

    function fetch_url(url, cb){
        console.log('Requesting ' + url + ' ...');
        jQuery.get(url).done(cb);
    }

    function check_url(url){
        var checker = /^http:\/\/www\.intscholarships\.com\//;

        // check url
        if(!checker.test(url)){
            console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
            return;
        }

        // 
        if(/\?page=\d+/.test(url)){
            console.error("Page urls are dissallowed");
            return;
        }

        base_url = url

        // request the page
        fetch_url(url, parse_first_page);
    }

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

})();
