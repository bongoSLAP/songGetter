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

function getSongAtUrl(url) {
    return new Promise(function(resolve, reject) {
        console.log('url: ', url);
        fetch('https://localhost:44370/api/GetSong?Url=' + url, {
            method: 'GET'
        }).then(function (response) {
            if (response.ok) {
                console.log('response: ', response);
                console.log(response.headers.get('Content-Type'));
                console.log(response.headers.get('Content-Disposition'));
                return resolve(response);
            }
            return Promise.reject(response);
        }).catch(function (error) {
            console.warn('Something went wrong.', error);
            reject(error);
        });
    });
}

//resolve() calls the fetch again, causes it to fire twice.
function getPlaylistAtUrl(url) {
    return new Promise(function(resolve, reject) {
        console.log('url: ', url);
        fetch('https://localhost:44370/api/GetPlaylist?Url=' + url, {
            method: 'GET'
        }).then(function (response) {
            if (response.ok) {
                console.log('response: ', response);
                console.log(response.headers.get('Content-Type'));
                console.log(response.headers.get('Content-Disposition'));
                return resolve(response);
            }
            return Promise.reject(response);
        }).catch(function (error) {
            console.warn('Something went wrong.', error);
            reject(error);
        });
    });
}

function handleBackgroundRequests(message, sender, sendResponse) {
    if (message.request === 'postUrlToApi') {
        console.log('posting to API...');
        sendResponse({dataReceived: message});

        if (!message.isPlaylist) {
            console.log('executing getSongAtUrl');
            getSongAtUrl(message.url).then(function(response) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    let fileName = response.headers.get('Content-Disposition').split('filename=')
                    fileName = fileName[1].split('"');
                    console.log('fileName: ', fileName);

                    chrome.tabs.sendMessage(tabs[0].id, {
                        request: 'injectFileDownload',
                        uri: 'https://localhost:44370/api/GetSong?Url=' + message.url,
                        fileName: fileName.filter(Boolean)[0]
                    }, function(response) {
                        console.log('console script response: ', response);
                    });
                });
            });
        }
        else {
            console.log('executing getPlaylistAtUrl');
            getPlaylistAtUrl(message.url).then(function(response) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    let fileName = response.headers.get('Content-Disposition').split('filename=')
                    fileName = fileName[1].split('"');
                    console.log('fileName: ', fileName);

                    chrome.tabs.sendMessage(tabs[0].id, {
                        request: 'injectFileDownload',
                        uri: 'https://localhost:44370/api/GetPlaylist?Url=' + message.url,
                        fileName: fileName.filter(Boolean)[0]
                    }, function(response) {
                        console.log('console script response: ', response);
                    });
                });
            });
        }
    }
}

chrome.runtime.onMessage.addListener(handleBackgroundRequests);