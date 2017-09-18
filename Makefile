PAGE_NAMES = firefox \
	firefox-os \
	owl-publishing \
	academia-sinica \
	moztw \
	demolab \
	wordcloud \
	jszhuyin

FILES = $(PAGE_FILES) \
	$(SERVICE_WORKER_ENTRY) \
	$(HASH_REQUEST_FILES) \
	$(RESOURCE_FILES)

SERVICE_WORKER_ENTRY = service-worker.min.js

PAGE_FILES = index.html \
	$(foreach NAME,$(PAGE_NAMES),portfolio/$(NAME)/index.html) \
	cv/index.html

HASH_REQUEST_FILES = assets/cv.min.js \
	assets/cv.min.css \
	assets/script.min.js \
	assets/style.min.css \
	assets/asmcrypto.js \
	assets/asmcrypto-decipher.min.js \
	assets/webcrypto-decipher.min.js \
	cv/steps.json.aes \
	cv/timdream-private.pdf.aes \
	cv/timdream.pdf \
	assets/reading-signpost-in-paris.jpg

RESOURCE_FILES = favicon.ico \
	assets/45-degree-fabric-dark.png \
	assets/little-pluses.png \
	assets/academia-sinica.png \
	assets/demolab-screenshot.png \
	assets/demolab.png \
	assets/firefox-os-commit.svg \
	assets/firefox-os-keyboard.png \
	assets/firefox-os.png \
	assets/firefox.png \
	assets/jszhuyin-learn.gif \
	assets/jszhuyin.png \
	assets/moztw-gfx-tw-tim.png \
	assets/moztw-ie8.png \
	assets/moztw.png \
	assets/owl-publishing.svg \
	assets/tiramisu-icon-64-shadow.png \
	assets/wordcloud-example-noscript.png \
	assets/wordcloud.png

INTERMEDIATE_FILES = assets/cv.js \
	assets/cv.css \
	assets/script.js \
	assets/style.css \
	assets/asmcrypto-decipher.js \
	assets/webcrypto-decipher.js \
	src/encryption/steps.json.aes \
	src/encryption/timdream-private.pdf.aes \
	src/encryption/testvalue.hex.txt

PAGE_EXTRA_FILE = $(wildcard src/$(1).header.inc.html)
PAGE_EXTRA_COMMAND = sed -e '/%PAGEEXTRA%/ {' $(if $(call PAGE_EXTRA_FILE,$(1)),-e 'r src/$(1).header.inc.html' -e 'd',-e 'd') -e '}'

define PAGE_RULE
portfolio/$(1)/index.html: Makefile \
		src/firstpaint.inc.css \
		src/page.inc.css \
		src/$(1).inc.html \
		src/$(1).title.inc.html \
		$(call PAGE_EXTRA_FILE,$(1)) \
		src/page.tmpl.html \
		src/footer.inc.html \
		assets/script.min.js \
		assets/style.min.css
	mkdir -p portfolio/$(1) &&\
	cat src/page.tmpl.html |\
		$(call LINE_REPLACER_COMMAND,src/footer.inc.html) |\
		$(call LINE_REPLACER_COMMAND,src/page.inc.css) |\
		$(call TEMPLATE_REPLACER_COMMAND,CONTENT,%$(1).inc.html%) |\
		$(call LINE_REPLACER_COMMAND,src/$(1).inc.html) |\
		$(call PAGE_EXTRA_COMMAND,$(1)) |\
		$(call LINE_REPLACER_COMMAND,src/firstpaint.inc.css) |\
		$(call TEMPLATE_REPLACER_COMMAND,PORTFOLIOTOTLE,%$(1).title.inc.html%) |\
		$(call LINE_REPLACER_COMMAND,src/$(1).title.inc.html) |\
		$(call HASH_REPLACER_COMMAND,assets/script.min.js) |\
		$(call HASH_REPLACER_COMMAND,assets/style.min.css) \
		> portfolio/$(1)/index.html
endef

TEMPLATE_REPLACER_COMMAND = sed "s'%$(1)%'$(2)'"
VAR_REPLACER_COMMAND = sed s/%$(notdir $(1))%/`cat $(1)`/
LINE_REPLACER_COMMAND = sed -e '/%$(notdir $(1))%/ {' -e 'r $(1)' -e 'd' -e '}'
HASH_REPLACER_COMMAND = sed s/%hash-$(notdir $(1))%/`md5 -q $(1) | cut -b 1-6`/

.PHONY: all
all: $(FILES)

index.html: Makefile \
						src/index.tmpl.html \
						src/firstpaint.inc.css \
						src/index.inc.css \
						src/footer.inc.html \
						assets/script.min.js \
						assets/style.min.css \
						assets/reading-signpost-in-paris.jpg
	cat src/index.tmpl.html |\
		$(call LINE_REPLACER_COMMAND,src/firstpaint.inc.css) |\
		$(call LINE_REPLACER_COMMAND,src/index.inc.css) |\
		$(call LINE_REPLACER_COMMAND,src/footer.inc.html) |\
		$(call HASH_REPLACER_COMMAND,assets/script.min.js) |\
		$(call HASH_REPLACER_COMMAND,assets/style.min.css) |\
		$(call HASH_REPLACER_COMMAND,assets/reading-signpost-in-paris.jpg) \
		> index.html

cv/index.html: src/cv.tmpl.html \
							 src/firstpaint-cv.inc.css \
							 assets/cv.min.js \
							 assets/cv.min.css \
							 cv/timdream.pdf
	mkdir -p cv &&\
	cat src/cv.tmpl.html |\
		$(call LINE_REPLACER_COMMAND,src/firstpaint-cv.inc.css) |\
		$(call HASH_REPLACER_COMMAND,assets/cv.min.js) |\
		$(call HASH_REPLACER_COMMAND,assets/cv.min.css) |\
		$(call HASH_REPLACER_COMMAND,cv/timdream.pdf) \
		> cv/index.html

service-worker.js: Makefile \
	   							 src/service-worker.tmpl.js \
	   							 $(PAGE_FILES) \
	   							 $(HASH_REQUEST_FILES) \
	   							 $(RESOURCE_FILES)
	cat	src/service-worker.tmpl.js |\
	  $(call TEMPLATE_REPLACER_COMMAND,ALLHASHES,`cat $(PAGE_FILES) \
			$(HASH_REQUEST_FILES) \
			$(RESOURCE_FILES) | md5 -q`) |\
		$(call TEMPLATE_REPLACER_COMMAND,FILELIST,$(dir $(PAGE_FILES)) \
		  $(foreach NAME,$(HASH_REQUEST_FILES),$(NAME)?_=$(shell md5 -q $(NAME) | cut -b 1-6)) \
		  $(RESOURCE_FILES)) \
		> service-worker.js

assets/cv.js: Makefile \
							src/assets/cv.tmpl.js \
							src/assets/common.inc.js \
							assets/webcrypto-decipher.min.js \
							assets/asmcrypto-decipher.min.js
	cat src/assets/cv.tmpl.js |\
		$(call LINE_REPLACER_COMMAND,src/assets/common.inc.js) |\
		$(call HASH_REPLACER_COMMAND,assets/webcrypto-decipher.min.js) |\
		$(call HASH_REPLACER_COMMAND,assets/asmcrypto-decipher.min.js) \
		> assets/cv.js

assets/cv.css: Makefile \
							 src/assets/cv.tmpl.css
	cat src/assets/cv.tmpl.css \
		> assets/cv.css

assets/script.js: Makefile \
									src/assets/script.tmpl.js \
									src/assets/common.inc.js
	cat src/assets/script.tmpl.js |\
		$(call LINE_REPLACER_COMMAND,src/assets/common.inc.js) \
		> assets/script.js

assets/style.css: Makefile \
									src/assets/style.tmpl.css
	cat src/assets/style.tmpl.css \
		> assets/style.css

assets/asmcrypto-decipher.js: Makefile \
															src/assets/asmcrypto-decipher.tmpl.js \
															src/assets/decipher-common.inc.js \
															src/encryption/iv.txt \
															src/encryption/salt.txt \
															src/encryption/testvalue.hex.txt \
															assets/asmcrypto.js \
															cv/steps.json.aes \
															cv/timdream-private.pdf.aes
	cat src/assets/asmcrypto-decipher.tmpl.js |\
		$(call LINE_REPLACER_COMMAND,src/assets/decipher-common.inc.js) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/salt.txt) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/iv.txt) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/testvalue.hex.txt) |\
		$(call HASH_REPLACER_COMMAND,assets/asmcrypto.js) |\
		$(call HASH_REPLACER_COMMAND,cv/steps.json.aes) |\
		$(call HASH_REPLACER_COMMAND,cv/timdream-private.pdf.aes) \
		> assets/asmcrypto-decipher.js

./node_modules/.bin/uglifycss \
./node_modules/uglify-es/bin/uglifyjs:
		npm install

%.min.css: Makefile \
					 node_modules/.bin/uglifycss \
					 %.css
	./node_modules/.bin/uglifycss $*.css --output $*.min.css

%.min.js.map \
%.min.js: Makefile \
					node_modules/uglify-es/bin/uglifyjs \
					%.js
	./node_modules/uglify-es/bin/uglifyjs --compress --mangle \
		--comments /^!/ \
		--source-map "root='/',url='$(notdir $*.min.js.map)'" \
		--output $*.min.js -- $*.js

assets/webcrypto-decipher.js: Makefile \
															src/assets/webcrypto-decipher.tmpl.js \
															src/assets/decipher-common.inc.js \
															src/encryption/iv.txt \
															src/encryption/salt.txt \
															src/encryption/testvalue.hex.txt \
															cv/steps.json.aes \
															cv/timdream-private.pdf.aes
	cat src/assets/webcrypto-decipher.tmpl.js |\
		$(call LINE_REPLACER_COMMAND,src/assets/decipher-common.inc.js) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/salt.txt) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/iv.txt) |\
		$(call VAR_REPLACER_COMMAND,src/encryption/testvalue.hex.txt) |\
		$(call HASH_REPLACER_COMMAND,cv/steps.json.aes) |\
		$(call HASH_REPLACER_COMMAND,cv/timdream-private.pdf.aes) \
		> assets/webcrypto-decipher.js

cv/%.aes: src/encryption/%.aes
	cp $< $@

src/encryption/steps.json.aes \
src/encryption/timdream-private.pdf.aes \
src/encryption/testvalue.hex.txt: Makefile \
																	src/encryption/cipher.js \
																	src/encryption/password.secret \
																	src/encryption/iv.txt \
																	src/encryption/salt.txt \
																	src/encryption/steps.json \
																	src/encryption/timdream-private.pdf
	./src/encryption/cipher.js

$(foreach NAME,$(PAGE_NAMES),$(eval $(call PAGE_RULE,$(NAME))))

.PHONY: clean
clean:
	rm $(FILES) \
		$(INTERMEDIATE_FILES)

.PHONY: watch
watch:
	fswatch -o . | xargs -n1 -I{} time make -j4
