const GETSONGBUTTONEVENT = (function() {
    let getSongButton = document.querySelector('#get-song');

    let buttonEvent = function() {

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {request: 'getUrlFromContent'}, function(response) {
                console.log('Requesting url from content');

                console.log('response: ', response);

                chrome.runtime.sendMessage({
                    request: 'postUrlToApi',
                    url: response.url
                },
                function(response) {
                    console.log('posting: ', JSON.stringify(response.dataFetched, null, 4));
                });
            });
        });
    };

    getSongButton.addEventListener('click', buttonEvent)
}());