

chrome.extension.sendRequest('ready', function(o){
    console.assert(o.key != null);
    console.assert(o.data != null);

    /* printing display hash */
    $('body').append('<h1>' + o.key + ' (' + sha1(o.data)  + ')' + '</h1>')

    $('div#patterns > div').each(function(){
        if(o.key.indexOf(this.id) == 0){
            $(this).removeAttr('id');

            gen_elements($(this), JSON.parse(LZW.decode(o.data)));

            return false;
        }
    });

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

