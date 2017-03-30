var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
    }); 
    
    setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}

var createSongRow = function (songNumber, songName, songLength) {
    var template =
            '<tr class="album-view-song-item">'
            + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
            + '  <td class="song-item-title">' + songName + '</td>'
            + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
            + '</tr>'
            ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));
    
        if (currentlyPlayingSongNumber !== null) {
            var currentPlayingContainer = getSongNumberCell(currentlyPlayingSongNumber);
            currentPlayingContainer.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            $(this).html(pauseButtonTemplate);
            $playPauseButton.html(playerBarPauseButton)
            setSong(songNumber);
            currentSoundFile.play();
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $playPauseButton.html(playerBarPauseButton)
                currentSoundFile.play();
            } else {
                $(this).html(playButtonTemplate);
                $playPauseButton.html(playerBarPlayButton)
                currentSoundFile.pause();
            }
        } 
        updateSeekBarWhileSongPlays();
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(currentVolume + '%');
        $volumeThumb.css({left: currentVolume + '%'});
    };
    
    var hoverHandler = function(event) {
        var songNumberContainer = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberContainer.attr('data-song-number'));
           
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberContainer.html(playButtonTemplate);
        };
        
        $(this).mouseleave( function () {
            if (songNumber !== currentlyPlayingSongNumber) {
            songNumberContainer.html(songNumber);
        };
        });
    };
    
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(hoverHandler);
    return $row;
    
};

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumSongList = $('.album-view-song-list');
var $albumImage = $('.album-cover-art');

var setCurrentAlbum = function (album) {
    
    currentAlbum = album;
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

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime())
        });
    }
};


var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);            
        }
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event){
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($(this).parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio * 100);            
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.current-time').html(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.total-time').html(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
    var minutes = Math.floor(parseFloat(timeInSeconds) / 60);
    var seconds = Math.floor(parseFloat(timeInSeconds) - minutes * 60)
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ":" + seconds;
};


var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('main-controls .play-pause').html(playerBarPauseButton)
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};


var previousSong = function() {
    
    var getLastSongNumber = function(index) {
        if (index == currentAlbum.songs.length - 1) {
            index = 1;
        } else {
            index = index + 2;  
        } 
        return index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updatePlayerBarSong();
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = parseInt(getLastSongNumber(currentSongIndex));
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    updateSeekBarWhileSongPlays();
};

var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        if (index == 0) {
            index = currentAlbum.songs.length;
        } else {
            index = index;  
        } 
        return index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updatePlayerBarSong();
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = parseInt(getLastSongNumber(currentSongIndex));
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    updateSeekBarWhileSongPlays();
};

var togglePlayFromPlayerBar = function() {
    if (currentlyPlayingSongNumber === null) {
        $playPauseButton.html(playerBarPauseButton)
        setSong(1);
        $('.song-item-number[data-song-number="' + 1 + '"]').html(pauseButtonTemplate);
        currentSoundFile.play();
        updatePlayerBarSong();
        updateSeekBarWhileSongPlays();
    } else if (currentSoundFile.isPaused()) {
        var currentlyPlayingContainer = getSongNumberCell(currentlyPlayingSongNumber);
        currentlyPlayingContainer.html(pauseButtonTemplate);
        $playPauseButton.html(playerBarPauseButton);
        currentSoundFile.play();    
    } else if (currentSoundFile) {
        var currentlyPlayingContainer = getSongNumberCell(currentlyPlayingSongNumber);
        currentlyPlayingContainer.html(playButtonTemplate);
        $playPauseButton.html(playerBarPlayButton);
        currentSoundFile.pause();
    };
    
    var $volumeFill = $('.volume .fill');
    var $volumeThumb = $('.volume .thumb');
    $volumeFill.width(currentVolume + '%');
    $volumeThumb.css({left: currentVolume + '%'});
    
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 60;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause')

$(document).ready(function() {
   
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);

    var albums = [albumPicasso, albumMarconi, albumFuzzy];
    var albumIndex = 1;
    $albumImage.click(function(event) {
        
        setCurrentAlbum(albums[albumIndex]);
        albumIndex++;
        if (albumIndex == albums.length) {
            albumIndex = 0;
        }
        currentSoundFile.stop();
        currentlyPlayingSongNumber = null;
        $('.currently-playing .song-name').text(" ");
        $('.currently-playing .artist-name').text(" ");
        $('.currently-playing .artist-song-mobile').text(" ");
        $playPauseButton.html(playerBarPlayButton)
        
    });
});
