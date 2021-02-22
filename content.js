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
            if (message.request === 'getDataFromContent') {
                let url = window.location.href;
                
                //subject to frequent changes, dependant on exact structure of youtube webpage, could change at any moment
                let constructTitleObject = function() {
                    let titleObject = {};

                    if (document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-primary-info-renderer')[1] != undefined) {
                        titleObject.song = document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-primary-info-renderer')[1].innerText;
                    }

                    if (document.querySelectorAll('a.yt-simple-endpoint.style-scope.yt-formatted-string')[0] != undefined) {
                        console.log('yes0')
                        titleObject.playlistWithSongPlaying = document.querySelectorAll('a.yt-simple-endpoint.style-scope.yt-formatted-string')[0].innerText;
                    }

                    if (document.querySelector('yt-formatted-string#text-displayed') != undefined) {
                        console.log('yes1');
                        titleObject.playlistNoSong = document.querySelector('yt-formatted-string#text-displayed').innerText;
                    }
                    else if (document.querySelector('h1#title.style-scope.ytd-playlist-sidebar-primary-info-renderer') != undefined) {
                        console.log('yes2');
                        titleObject.playlistNoSong = document.querySelector('h1#title.style-scope.ytd-playlist-sidebar-primary-info-renderer').innerText;
                    }

                    return titleObject;
                };

                sendResponse({
                    url: url,
                    titles: constructTitleObject()
                });
            }
            else if (message.request === 'injectFileDownload') {
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
    console.log('element: ', document.querySelectorAll('h1#title.style-scope.ytd-playlist-sidebar-primary-info-renderer')); //playlist no song


    //console.log('element: ', document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-primary-info-renderer')) //song in playlist
    //console.log('element: ', document.querySelectorAll('a.yt-simple-endpoint.style-scope.yt-formatted-string')); //playlist with song playing

    //console.log('element: ', document.querySelectorAll('yt-formatted-string.style-scope.ytd-video-primary-info-renderer')) //song no playlist


});