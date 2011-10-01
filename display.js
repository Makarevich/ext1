

chrome.extension.sendRequest('ready', function(o){
    console.assert(o.key != null);
    console.assert(o.data != null);

    /* printing display hash */
    $('body').append('<h1>' + o.key + ' ' + o.pat + ' (' + sha1(o.data)  + ')' + '</h1>')

    // var pat = $('div#patterns > div').hasClass(o.key);
    var pat = $('div#patterns > div').filter(function(){
        return $(this).hasClass(o.pat);
    });

    if (pat.size() == 0){
        $('body').append('<i>No pattern found</i>');
        return;
    }else if (pat.size() > 1){
        $('body').append('<i>Multiple patterns found</i>');
        return;
    }

    gen_elements(pat, JSON.parse(LZW.decode(o.data)));

    function gen_elements(pat, data){
        var nodes = [];

        var body = $('body');

        var counter_node = $(document.createElement('h2')).appendTo(body);

        // find template node
        nodes['key'] = pat.find('.key');
        for(var i in data){
            nodes[i] = pat.find('.' + i);
        }

        // process data
        var count = 0;
        for(var i in data[any_key(data)]){
            nodes['key'].text(keycode.enkey(i));
            for(var j in data){
                nodes[j].text(data[j][i]);      // TODO: specify various types of content
            }
            pat.clone().appendTo(body);
            ++count;
        }

        counter_node.text(count.toString() + ' posts');

        function any_key(o){
            for(var k in o) return k;
        }
    }
});

