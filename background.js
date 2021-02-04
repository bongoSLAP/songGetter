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
                console.log(response.headers.get('Content-Type'));
                console.log(response.headers.get('Content-Disposition'));
                return response;
            }
            return Promise.reject(response);
        }).then(function (data) {
            console.log('data:', data);
            resolve(data);
        }).catch(function (error) {
            console.warn('Something went wrong.', error);
            reject(error);
        });
    });
}

function deleteDownloadedFile(fileName) {
    return new Promise(function(resolve, reject) {
        fetch('api/DeleteAfterDownload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileName: fileName})
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
    });
}

function handleBackgroundRequests(message, sender, sendResponse) {
    if (message.request === 'postUrlToApi') {
        sendResponse({dataReceived: message});
        getSongAtUrl(message.url).then(function(response) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                let fileName = response.headers.get('Content-Disposition').split('filename=')
                fileName = fileName[1].split('"');
                console.log('fileName: ', fileName);

                chrome.tabs.sendMessage(tabs[0].id, {
                    request: 'injectMp3Download',
                    uri: 'https://localhost:44370/api/GetSong?Url=' + message.url,
                    fileName: fileName.filter(Boolean)[0]
                }, function(response) {
                    console.log('console script response: ', response);
                });
            });
        });
    }
    else if (message.request === 'deleteDownloadedFile') {
        console.log('message.fileName:', message.fileName)
        deleteDownloadedFile(message.fileName);
        sendResponse({dataReceived: message});
    }
}

chrome.runtime.onMessage.addListener(handleBackgroundRequests);