const UTILITYFUNCTIONS = (function() {
    let click = function(element) {
        // Create our event (with options)
        var event = new MouseEvent('click', {
            bubbles: true,
            cancelable: false,
            view: window
        });
    };

    return {
        handleContentRequests: function(message, sender, sendResponse) {
            if (message.request === 'getUrlFromContent') {
                let url = window.location.href;
                sendResponse({url: url.split('?v=')[1]});
            }
            else if (message.request === 'injectMp3Download') {
                console.log('uri:', message.uri);

                let download = document.createElement('a');
                download.id = 'song-getter-download';
                download.setAttribute('href', message.uri);
                download.setAttribute('download', message.fileName);

                document.querySelector('body').appendChild(download);
                let downloadInDoc = document.querySelector('#song-getter-download');
                downloadInDoc.click();
                downloadInDoc.remove();

                console.log('fileName: ', message.fileName);
                chrome.runtime.sendMessage({
                    request: 'deleteDownloadedFile',
                    fileName: message.fileName
                }, 
                function(response) {
                    console.log('response: ', response);
                }); 

                sendResponse({DataRecieved: message});
            }
        }
    };
}());

window.addEventListener('load', function() {
    chrome.runtime.onMessage.addListener(UTILITYFUNCTIONS.handleContentRequests);
});