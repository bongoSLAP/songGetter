chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostContains: 'youtube.com' },
                }),
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

function postUrl(url) {
    return new Promise(function(resolve, reject) {
        console.log('url: ', url);
        fetch('https://localhost:44370/api/GetSong?Url=' + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (data) {
            console.log('data:', data);
            resolve(data);
        }).catch(function (error) {
            console.warn('Something went wrong.', error);
            reject(error);
        });
    }).then(function(message) {
        console.log('message:', message);
        return message;
    });
}

function handleBackgroundRequests(message, sender, sendResponse) {
    if (message.request === 'postUrlToApi') {
        sendResponse({dataReceived: message});
        postUrl(message.url);
    }
}

chrome.runtime.onMessage.addListener(handleBackgroundRequests);