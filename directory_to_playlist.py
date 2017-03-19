#!/usr/bin/env python

from sys import argv
import os
import json

inpath = argv[1]
outpath = argv[2]

songs = []

for root, dirs, files in os.walk(inpath):
	for fn in files:
		if fn[-3:].lower() in ("mp3", "m4a", "ogg"):
			songs.append("/".join((root, fn)))


json.dump({"songs": songs}, open(outpath, "w"))