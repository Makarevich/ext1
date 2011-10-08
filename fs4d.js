
var m = (function () {

    return {
        get_fetcher_api:    function(){
            return {
                get_url_patterns: function(){
                    return {
                        checker:    /^http:\/\/www\.scholars4dev\.com\//,
                        pages:      /\/page\/\d+.$/
                    };
                },

                parse_paginator: function(docroot){
                    // === parse paginator text ===
                    var content = $('div#content > div > div.maincontent', docroot);

                    console.assert(content.length == 1, 'content.length != 1');

                    var page_text = content.find('div.wp-pagenavi > span.pages').text();

                    if(!page_text){
                        // there is only one page
                        return [1, 1];
                    }else{
                        var m = page_text.match(/Page (\d+) of (\d+)/);

                        if(!m){
                            console.log(page_text);
                            return false;
                        }

                        console.assert(m[1] == 1, 'initial page is not page 1');

                        return [1, m[2]];
                    }
                },

                get_page_url: function(base_url, cur){
                    return base_url + ((cur > 1) ? ('page/' + cur.toString()) : '');
                },

                parse_posts: function(docroot){
                    return $('div#content > div > div.maincontent > div.post.clearfix', docroot).map(function(i, dom){
                        return {
                            title:      $("div.entry > h2", this).text(),
                            href:       $("div.entry > h2 > a", this).attr('href'),
                            owner:      $("div.entry > div:eq(0)", this).text(),
                            other:      $("div.entry > div:eq(1)", this).text(),
                            date:       $("div.postdate > div.left", this).text()
                        };
                    }).get();
                },

                name:   's4d'
            };

        },
        
        get_detail_api:     function () {
            return {
                parse_details: function(docroot){
                }
            };
        }
    }

})();
