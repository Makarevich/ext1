
var m = (function () {


    return {
        get_fetcher_api:    function(){
            return {
                get_url_patterns: function(){
                    return {
                        checker:    /^http:\/\/www\.intscholarships\.com\//,
                        pages:      /\?page=\d+/
                    };
                },

                parse_paginator: function(docroot){
                    // === parse paginator text ===
                    var content = $('div#inner-content > div.item-list > ul.pager > li.pager-last > a', docroot);

                    console.assert(content.length == 1);

                    var m = content.attr('href').match(/\?page=(\d+)/);

                    if(!m){
                        console.log(href);
                        return false;
                    }

                    return [1, m[1]];
                },

                get_page_url: function(base_url, cur){
                    console.log(base_url);
                    return base_url + ((cur > 1) ? ('?page=' + cur.toString()) : '');
                },

                parse_posts: function(docroot){
                    return $('div#inner-content > div.node', docroot).map(function(i, dom){
                        return {
                            href:       'http://www.intscholarships.com' + $("h2.title > a", this).attr('href'),
                            title:      $("h2.title > a", this).text(),
                            text:       $("div.content", this).text()
                        };
                    }).get();
                },

                name:   'ints'
            };

        }
    }

})();
