#!/bin/sh

# Update hash value in cache.manifest by generate md5 hash of all local files

HASH=`find . -type f | grep -v \.git | grep -v "cache\.manifest" | xargs cat - | md5`
eval "sed -i '' -E -e 's/^# hash.*$/# hash "$HASH"/' cache.manifest"
