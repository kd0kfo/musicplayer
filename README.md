# musicplayer
Simple Web Music Player

## About
Runs using pure javascript. To run, it requires a audio html tag that has an id of "player". Also, "start_player" should be called when the HTML page has been loaded. An example page is provided.

## Playlist
The player reads a list of songs from a playlist JSON file. This JSON object should have a "songs" entry that is a list of media file paths. The path to the JSON file can be specified with the "playlist" URL parameter, with "/playlist.json" being the default.
