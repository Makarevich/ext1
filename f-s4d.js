
(function () {

    var base_url;           // base fetching url

    var init_num;
    var init_html;

    var page_cur;
    var page_total;


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

    function parse_first_page(html){
        docroot.innerHTML = html;

        // === parse paginator text ===
        var content = $('div#content > div > div.maincontent', docroot);

        console.assert(content.length != 1);

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

        request_next_page();
    }

    function request_next_page(){
        if(page_cur > page_total){
            store_posts();
        }

        if(page_cur == init.num){
            parse_posts(init.html);
            return;
        }

        var url = base_url;
        if(i > 1) url += '/pages/' + i.toString();

        jQuery.get(url).done(parse_posts);
    }

    function parse_posts(html){
        docroot.innerHTML = html;

        // ....

        page_cur++;
        request_next_page();
    }

})();
