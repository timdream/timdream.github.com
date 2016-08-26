#!/bin/sh

# Download Remote files to include them into hash calculation

mkdir -p .tmp
wget -q -O .tmp/webfont 'https://fonts.googleapis.com/css?family=Gloria+Hallelujah|Merriweather:700'
wget -q -O .tmp/gravatar 'https://gravatar.com/avatar/2becaf1073957bdad2f06e183731131d?s=200'

# Update hash value in cache.manifest by generate md5 hash of all local files

HASH=`find . -type f | grep -v \.git | grep -v "site\.appcache" | xargs cat - | md5`
eval "sed -i '' -E -e 's/^# hash.*$/# hash "$HASH"/' site.appcache"

rm -R .tmp
