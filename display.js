

chrome.extension.sendRequest('ready', function(o){
    console.assert(o.key != null);
    console.assert(o.data != null);

    /* printing display info */
    $('body').append('<h1>' + o.key + ' ' + o.pat + '</h1>')
    $('body').append('<p>' + sha1(o.data) + '</p>')
    $('body').append('<p>' + keycode.chars() + '</p>')

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

    gen_elements(pat, LZW.decompress(o.data));

    function gen_elements(pat, data){
        var body = $('body');

        var counter_node = $(document.createElement('h2')).appendTo(body);

        var nodes = {};

        // find template node
        nodes['key'] = pat.find('.key');
        for(var i in data){
            nodes[i] = pat.find('.' + i);
        }

        // process data
        var count = 0;
        for(var i in data[any_key(data)]){
            var nodes_to_remove = [];

            nodes['key'].text(keycode.enkey(i));
            for(var j in data){
                var node = nodes[j];
                var data_array = data[j];

                var set_node_data = node.hasClass('html')
                    ? set_node_html : set_node_text;

                if(node.hasClass('array')){
                    //
                    // Array nodes imply that the appropriate data
                    // not a text, but an array (which it traversed with
                    // a for/in loop). For each element of the array a copy
                    // of the node is made. This copy is placed AFTER
                    // the original node, making all the copies the siblings
                    // of the node.
                    //
                    // All copies are removed after the data element is processed.
                    //

                    console.assert(data_array[i].length,
                        "Field '" + j + "' of element " + i +
                        " is not an array");
            
                    set_node_data(node, data_array[i][0]);

                    for(var k = 1; k < data_array[i].length; k++){
                        node = node.clone().insertAfter(node);

                        nodes_to_remove.push(node);

                        set_node_data(node, data_array[i][k]);
                    }
                }else{
                    set_node_data(node, data_array[i]);
                }

            }
            pat.clone().appendTo(body);
            ++count;

            // remove all generated nodes from the pattern
            for(var j in nodes_to_remove){
                nodes_to_remove[j].remove();
            }
        }

        counter_node.text(count.toString() + ' posts');

        function any_key(o){
            for(var k in o) return k;
        }

        function set_node_html(jnode, html){
            jnode.html(html);
        }

        function set_node_text(jnode, text){
            jnode.text(text);
        }
    }
});

