

/*
 * This page represents general pattern of so called "summary fetchers".
 */

(function () {

    var base_url;           // base fetching url

    var init_num;
    var init_html;

    var page_cur;
    var page_total;

    var posts_data = [];

    console.log('Running s4d fetcher');

    // start the process
    check_url(data_key1);

    function fetch_url(url, cb){
        console.log('Requesting ' + url + ' ...');
        jQuery.get(url).done(cb);
    }

    function check_url(url){
        var checker = /^http:\/\/www\.scholars4dev\.com\//;

        // check url
        if(!checker.test(url)){
            console.error("URL \"" + url + "\" doesnot match /" + checker.source + "/");
            return;
        }

        // obtain "base url"
        var m = url.match(/^(.*\/)page\/\d+.$/);            // NOTE: here url MAY match to url of some page (though now it is discouraged)
        if(m){
            base_url = m[1];
        }else{
            base_url = url;
        }

        // request the page
        fetch_url(url, parse_first_page);
    }

    function parse_first_page(html){
        docroot.innerHTML = html;

        // === parse paginator text ===
        var content = $('div#content > div > div.maincontent', docroot);

        console.assert(content.length == 1, 'content.length != 1');

        var page_text = content.find('div.wp-pagenavi > span.pages').text();

        var m = page_text.match(/Page (\d+) of (\d+)/);

        if(!m){
            console.error("Cannot parse paginator text \"" + page_text + "\"");
            return;
        }

        init_num  = m[1];
        init_html = html;

        page_cur   = 1;
        page_total = m[2];

        console.log('Current page: ' + page_cur + '/' + page_total);

        request_next_page();
    }

    function request_next_page(){
        if(page_cur > page_total){
            store_posts();
            return;
        }

        if(page_cur == init_num){
            parse_posts(init_html);
            return;
        }

        var url = base_url;
        if(page_cur > 1) url += 'page/' + page_cur.toString();

        fetch_url(url, parse_posts);
    }

    function parse_posts(html){
        docroot.innerHTML = html;

        var posts = $('div#content > div > div.maincontent > div.post.clearfix', docroot);

        posts.each(function(i, dom){
            var o = {
                title:      $("div.entry > h2", this).text(),
                href:       $("div.entry > h2 > a", this).attr('href'),
                owner:      $("div.entry > div:eq(0)", this).text(),
                other:      $("div.entry > div:eq(1)", this).text()
            };

            posts_data.push(o);
        });

        // iterate
        page_cur++;
        request_next_page();
    }

    function store_posts(){
        console.log('Parsed ' + posts_data.length + ' posts');

        localStorage[data_key2] = LZW.encode(JSON.stringify(posts_data));
    }

})();
