//
// Requires body's on load to call start_player and have an audio tag with id of "player".
// The play list should be json file at "playlist.json". This should have a "songs" element that
// is a list of song paths".
//
// globals
var _player, _playlist, _stop, _next, _previous, _songs, _currpath;

function shuffle(array) {
    // Credit where credit's due: Borrowed from https://bost.ocks.org/mike/shuffle/
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function get_title (songpath) {
    var newtitle = songpath;
    if (newtitle !== null) {
        var idx = newtitle.lastIndexOf("/");
        if (idx != -1 && idx + 1 < newtitle.length) {
            newtitle = newtitle.substr(idx + 1);
        }
    }
    return newtitle;
}

function playlistItemClick(clickedElement) {
    var selected = _playlist.querySelector(".selected");
    if (selected) {
        selected.classList.remove("selected");
    }
    clickedElement.classList.add("selected");

    var songidx = clickedElement.getAttribute("songid");
    if (songidx == NaN || songidx >= _songs.length) {
        console.log("Invalid song id");
        return;
    }

    var songpath = _songs[songidx];

    var newtitle = songpath;
    if (newtitle !== null) {
        document.title = newtitle;
    }

    _player.src = songpath;
    _player.play();
    _currpath = songpath;
}

function playNext() {
    var selected = _playlist.querySelector("li.selected");
    if (selected && selected.nextElementSibling) {
        playlistItemClick(selected.nextElementSibling);
    }
}

function playPrevious() {
    var selected = _playlist.querySelector("li.selected");
    if (selected && selected.previousElementSibling) {
        playlistItemClick(selected.previousElementSibling);
    }
}

function dragdrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (e !== null && e.dataTransfer !== null) {
        var orig_song_id = e.dataTransfer.getData('text/plain');
        var this_song_id = this.getAttribute("songid");
        
        orig_song_id = parseInt(orig_song_id);
        this_song_id = parseInt(this_song_id);
        if (orig_song_id == NaN || this_song_id == NaN || orig_song_id < 0 || this_song_id < 0 || orig_song_id > _songs.length || this_song_id > _songs.length) {
            console.log("Invalid song id");
            return;
        }
        if (orig_song_id == this_song_id) {
            return;
        }

        if (orig_song_id < this_song_id) {
            var orig_song = _songs[orig_song_id];
            var beginning = _songs.slice(0, orig_song_id);
            var middle = _songs.slice(orig_song_id+1, this_song_id).concat([orig_song]);
            var end = _songs.slice(this_song_id, _songs.length);

            _songs = beginning.concat(middle.concat(end));
            refresh_songlist();
        } else {
            var orig_song = _songs[orig_song_id];
            var beginning = _songs.slice(0, this_song_id);
            var middle = [orig_song].concat(_songs.slice(this_song_id, orig_song_id));
            var end = _songs.slice(orig_song_id+1, _songs.length);

            _songs = beginning.concat(middle.concat(end));
            refresh_songlist();
        }
    }
}

function dragover (e) {
    if (e.preventDefault) {
        e.preventDefault(); 
    }
  e.dataTransfer.dropEffect = 'move'; 
  return false;
}

function dragstart(e) {
    var songid = this.getAttribute("songid");
    
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', songid);
}

function dragend(e) {
}

function refresh_songlist() {
    var i = 0;
    _playlist.innerHTML = "";
    for (song in _songs) {
        var songpath = _songs[song];
        var songnode = document.createElement("li");
        songnode.setAttribute("songid", i);
        songnode.setAttribute("draggable", "true");
        if (songpath == _currpath) {
            songnode.setAttribute("class", "selected");
        }
        songnode.addEventListener("dragstart", dragstart, false);
        songnode.addEventListener("dragend", dragend, false);
        songnode.addEventListener("drop", dragdrop, false);
        songnode.addEventListener("dragover", dragover, false);
        i++;
        songnode.innerHTML = get_title(songpath);
        _playlist.appendChild(songnode);
    }
};

function get_parameter(parameterName, defaultvalue) {
    var retval = defaultvalue;
    location.search.substr(1).split("&").forEach(function (item) {
        var tmp = item.split("=");
        if (tmp[0] === parameterName) 
            retval = decodeURIComponent(tmp[1]);
    });
    return retval;
}

function have_parameter(parameter_name) {
    var retval = false;
    location.search.substr(1).split("&").forEach(function (item) {
        if (item == parameter_name) {
            retval = true;
        }
    });
    return retval;
}

function start_player() {

    var body = document.getElementsByTagName("body")[0];
    _player = document.getElementById("player");
   
    var playlist_frame = document.createElement("div");
    playlist_frame.setAttribute("id", "playlist_frame");
    playlist_frame.setAttribute("style", "overflow:scroll; height:400px");
    body.appendChild(playlist_frame);

    _playlist = document.createElement("ul");
    _playlist.setAttribute("id", "playlist");
    playlist_frame.appendChild(_playlist);
   
    _previous = document.createElement("button");
    _previous.setAttribute("id", "previous");
    _previous.innerHTML = "Previous";
    body.appendChild(_previous);

    _stop = document.createElement("button");
    _stop.setAttribute("id", "stop");
    _stop.innerHTML = "Stop";
    body.appendChild(_stop);

    _next = document.createElement("button");
    _next.setAttribute("id", "next");
    _next.innerHTML = "Next";
    body.appendChild(_next);

    var show_controls = document.createElement("button");
    show_controls.setAttribute("id", "show_controls");
    show_controls.addEventListener("click", function () {
        _player.controls = !_player.controls;
    });
    show_controls.innerHTML = "Controls";
    body.appendChild(show_controls);



    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', get_parameter('playlist','/playlist.json'), true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                var obj = JSON.parse(xmlhttp.responseText);
                var songlist = obj["songs"];
                if (have_parameter("shuffle")) {
                    songlist = shuffle(songlist);
                }
                _songs = songlist;
                refresh_songlist(); 
             }
        }
    };
    xmlhttp.send(null);

    _stop.addEventListener("click", function () {
        if (_player.paused) {
            _player.play();
        } else {
            _player.pause();
        }
    });
    _player.addEventListener("ended", playNext);
    _playlist.addEventListener("click", function (e) {
        if (e.target && e.target.nodeName === "LI") {
            playlistItemClick(e.target);
        }
    });
    _next.addEventListener("click", function () {
        playNext();
    });
    _previous.addEventListener("click", function () {
        playPrevious();
    });
};