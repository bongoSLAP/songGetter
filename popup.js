const GETDATA = (function() {
    return {
        fetchVideoDataFromContent: function() {
            return new Promise(function(resolve, reject) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {request: 'getDataFromContent'}, function(response) {
                        console.log('Requesting data from content');
                        console.log('response: ', response);

                        songContainer = document.querySelector('#download-song-container');
                        songTitle = document.querySelector('#current-song-title');

                        playlistContainer = document.querySelector('#download-playlist-container');
                        playlistTitle = document.querySelector('#current-playlist-title');
        
                        let urlObject = {};
        
                        if (response.url.includes('watch?v=') && response.url.includes('&list=')) {
                            console.log('both');

                            songTitle.innerText = response.titles.song;
                            playlistTitle.innerText = response.titles.playlistWithSongPlaying;
                    
                            songContainer.classList.remove('hidden');
                            playlistContainer.classList.remove('hidden');
                    
                            songContainer.classList.add('show-grid');
                            playlistContainer.classList.add('show-grid');
                    
                            urlObject.songUrl = response.url.split('?v=')[1];
                            urlObject.playlistUrl = response.url.split('?list=')[1];
                        }
                        else if (response.url.includes('watch?v=')) {
                            console.log('song in url');

                            songTitle.innerText = response.titles.song;
        
                            songContainer.classList.remove('hidden');
                            songContainer.classList.add('show-grid');
        
                            urlObject.songUrl = response.url.split('?v=')[1];
                        }
                        else if (response.url.includes('playlist?list=')) {
                            console.log('playlist in url');

                            playlistTitle.innerText = response.titles.playlistNoSong;
        
                            playlistContainer.classList.remove('hidden');
                            playlistContainer.classList.add('show-grid');
        
                            urlObject.playlistUrl = response.url.split('?list=')[1];
                        }
                        else {reject('youtube URL not recognised as video or playlist')}
        
                        resolve(urlObject);
                    });
                });
            });
        }
    };
}());

window.addEventListener('load', function() {

    let sendUrlToBackground = function(event, urlObject) {
        console.log('sendUrl');
        let url = "";
        let isPlaylist = false;
    
        if (urlObject.songUrl && urlObject.playlistUrl) {
            if (event.target.id == 'get-song-button') {url = urlObject.songUrl}
            else {
                url = urlObject.playlistUrl;
                isPlaylist = true;
            }
        }
        else if (urlObject.songUrl && !urlObject.playlistUrl) {
            url = urlObject.songUrl;
        }
        else if (!urlObject.songUrl && urlObject.playlistUrl) {
            url = urlObject.playlistUrl;
            isPlaylist = true;
        }
    
        chrome.runtime.sendMessage({
            request: 'postUrlToApi',
            isPlaylist: isPlaylist,
            url: url
        });
    };

    GETDATA.fetchVideoDataFromContent().then(function(urlObject) {
        console.log('url: ', urlObject);
        document.querySelector('#get-song-button').addEventListener('click', sendUrlToBackground(event, urlObject));
        document.querySelector('#get-playlist-button').addEventListener('click', sendUrlToBackground(event, urlObject));
    }).catch(function (/*error*/) {
        //console.warn(error);
    });
});


