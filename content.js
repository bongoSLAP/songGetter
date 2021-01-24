const UTILITYFUNCTIONS = (function() {
    return {
        handleContentRequests: function(message, sender, sendResponse) {
            if (message.request === 'getUrlFromContent') {
                let url = window.location.href;
                sendResponse({url: url.split('?v=')[1]});
            }
        }
    };
}());

window.addEventListener('load', function() {
    chrome.runtime.onMessage.addListener(UTILITYFUNCTIONS.handleContentRequests);
});