#!/bin/sh

# Update hash value in cache.manifest by generate md5 hash of all local files

HASH=`find . -type f | grep -v \.git | grep -v "site\.appcache" | xargs cat - | md5`
eval "sed -i '' -E -e 's/^# hash.*$/# hash "$HASH"/' site.appcache"
