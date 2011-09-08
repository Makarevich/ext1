
console.log('content script for ya.ru');

/*
chrome.extension.sendRequest({
    store_key:  "current url",
    store_data: document.location.href
}, function(resp){
    console.log("Previous data: " + resp.toString());
});
*/

var data = 'jQuery is a cross-browser JavaScript library designed to simplify the client-side scripting of HTML.[1] It was released in January 2006 at BarCamp NYC by John Resig. Used by over 46% of the 10,000 most visited websites, jQuery is the most popular JavaScript library in use today.[2][3] jQuery is free, open source software, dual-licensed under the MIT License and the GNU General Public License, Version 2.[4] jQuerys syntax is designed to make it easier to navigate a document, select DOM elements, create animations, handle events, and develop Ajax applications. jQuery also provides capabilities for developers to create plug-ins on top of the JavaScript library. This enables developers to create abstractions for low-level interaction and animation, advanced effects and high-level, theme-able widgets. The modular approach to the jQuery framework allows the creation of powerful and dynamic web pages and web applications.  Microsoft and Nokia have announced plans to bundle jQuery on their platforms,[5] Microsoft is adopting it initially within Visual Studio[6] for use within Microsofts ASP.NET AJAX framework and ASP.NET MVC Framework while Nokia has integrated it into their Web Run-Time widget development platform.[7] jQuery has also been used in MediaWiki since version 1.16.[8];';


console.log(data);
data = LZW.encode(data);
console.log(data);
data = LZW.decode(data);
console.log(data);

