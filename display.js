

chrome.extension.sendRequest('ready', function(o){
    console.assert(o.key != null);
    console.assert(o.data != null);

    $('div#patterns > div').each(function(){
        console.log(this);
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
        for(var i in data[0]){
            nodes[i] = pat.find('.' + i);
        }

        // process data
        for(var i in data){
            for(var j in data[i]){
                nodes[j].text(data[i][j]);      // TODO: specify various types of content
            }
            pat.clone().appendTo(body);
        }
    }
});

