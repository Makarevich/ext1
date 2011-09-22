

chrome.extension.sendRequest('ready', function(o){
    console.assert(o.key != null);
    console.assert(o.data != null);

    /* printing display hash */
    $('body').append('<h1>' + o.key + ' (' + sha1(o.data)  + ')' + '</h1>')

    // var pat = $('div#patterns > div').hasClass(o.key);
    var pat = $('div#patterns > div').filter(function(){
        return $(this).hasClass(o.key);
    });

    console.log(pat);

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

        // find template node
        nodes['key'] = pat.find('.key');
        for(var i in data[0]){
            nodes[i] = pat.find('.' + i);
        }

        // process data
        for(var i in data){
            nodes['key'].text(keycode.enkey(i));
            for(var j in data[i]){
                nodes[j].text(data[i][j]);      // TODO: specify various types of content
            }
            pat.clone().appendTo(body);
        }
    }
});

