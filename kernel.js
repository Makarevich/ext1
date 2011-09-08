
//localStorage.kernel_data = 'kernel data';


chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('Poking ' + tab.id.toString());
  chrome.tabs.sendRequest(tab.id, {poke:true});
});
