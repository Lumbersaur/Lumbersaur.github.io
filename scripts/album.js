var albumPicasso = {
        title: 'The Colors',
        artist: 'Pablo Picasso',
        label: 'Cubism',
        year: '1881',
        albumArtUrl: 'assets/images/album_covers/01.png',
        songs: [
            { title: 'Blue', duration: '4:26' },
            { title: 'Green', duration: '3:14' },
            { title: 'Red', duration: '5:01' },
            { title: 'Pink', duration: '3:21'},
            { title: 'Magenta', duration: '2:15'}
        ]
    };
 
var albumMarconi = {
        title: 'The Telephone',
        artist: 'Guglielmo Marconi',
        label: 'EM',
        year: '1909',
        albumArtUrl: 'assets/images/album_covers/20.png',
        songs: [
            { title: 'Hello, Operator?', duration: '1:01' },
            { title: 'Ring, ring, ring', duration: '5:01' },
            { title: 'Fits in your pocket', duration: '3:21'},
            { title: 'Can you hear me now?', duration: '3:14' },
            { title: 'Wrong phone number', duration: '2:15'}
        ]
    };

var albumFuzzy = {
        title: 'The Bear',
        artist: 'Fuzzy Wuzzy',
        label: 'Too Cold Records',
        year: '1995',
        albumArtUrl: 'assets/images/album_covers/22.fuzzywuzzy.jpg',
        songs: [
            { title: 'Was He?', duration: '2:11' },
            { title: 'The Bear With No Hair', duration: '4:44' },
            { title: 'Fuzzy Feelings', duration: '2:52'},
            { title: 'Wuzzy, Wuzzy Worries', duration: '3:31' },
            { title: 'Whats all the Fuzz?', duration: '2:41'}
        ]
    };

var createSongRow = function (songNumber, songName, songLength) {
    var template =
            '<tr class="album-view-song-item">'
            + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
            + '  <td class="song-item-title">' + songName + '</td>'
            + '  <td class="song-item-duration">' + songLength + '</td>'
            + '</tr>'
            ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = $(this).attr('data-song-number');
    
        if (currentlyPlayingSong !== null) {
            var currentPlayingContainer = $('.song-item-number[data-song-number="' + currentlyPlayingSong + '"]');
            currentPlayingContainer.html(currentlyPlayingSong);
        } 
        if (currentlyPlayingSong === songNumber) {
            $(this).html(playButtonTemplate);
            currentlyPlayingSong = null;
        } else if (currentlyPlayingSong !== songNumber) {
            $(this).html(pauseButtonTemplate);
            currentlyPlayingSong = songNumber;
        }
    };
    
    var onHover = function(event) {
        var songNumberContainer = $(this).find('.song-item-number');
        var songNumber = songNumberContainer.attr('data-song-number');
        
        if (songNumber !== currentlyPlayingSong) {
            songNumberContainer.html(playButtonTemplate);
        }
    };
    var offHover = function(event){
        var songNumberContainer = $(this).find('.song-item-number');
        var songNumber = songNumberContainer.attr('data-song-number');
        
        if (songNumber !== currentlyPlayingSong) {
            songNumberContainer.html(songNumber);
        }
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
    
    
};

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumSongList = $('.album-view-song-list');
var $albumImage = $('.album-cover-art');

var setCurrentAlbum = function (album) {
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
     }
 };

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var currentlyPlayingSong = null;

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
     
    var albums = [albumPicasso, albumMarconi, albumFuzzy];
    var index = 1;
    $albumImage.click(function(event) {
        setCurrentAlbum(albums[index]);
        index++;
        if (index == albums.length) {
            index = 0;
        }
    });
});
