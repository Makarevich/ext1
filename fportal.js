
var m = (function () {

    return {
        get_fetcher_api:    function(){
            var query_length;

            return {
                get_url_patterns: function(){
                    return {
                        checker:    /^http:\/\/www\.scholarshipportal\.eu\//,
                        pages:      /\&start=(?!0($|\&))/
                    };
                },

                parse_paginator: function(docroot){
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

                    console.log('len: ' + query_length);

                    return [1, (max / len) + 1];
                },

                get_page_url: function(base_url, cur){
                    return base_url.replace(/\&start=\d+/, function(m){
                        return '&start=' + ((cur - 1) * query_length).toString();
                    });
                },

                parse_posts: function(docroot){
                    return $('div.spResults > ol.ResultsList > li.ResultItem', docroot).map(function(i, dom){
                        var tds = $("div.ResultItemContent > table.ScholarshipExtraInfo " + 
                            "tr > td:last-child", this);

                        if( $(this).hasClass("InlineBanner") ){
                            return null;
                        }

                        return {
                            href:       'http://www.scholarshipportal.eu/' + $("h2 > a", this).attr('href'),
                            title:      $("h2 > a", this).text(),
                            text:       $("div.ResultItemContent > p.Description", this).text(),
                            levels:     tds.eq(0).text(),
                            duration:   tds.eq(1).text(),
                            amount:     tds.eq(2).text()
                        };
                    }).get();
                },

                name:   'portal'
            };

        }
    }

})();
