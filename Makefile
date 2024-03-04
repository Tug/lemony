start-web: install
	yarn web

install:
	yarn

start-expo: install
	cd apps/expo && yarn start

start-android: install
	cd apps/expo && yarn android

start-ios: install
	cd apps/expo && yarn ios

start-web-clear: clean install
	yarn web

build-web: install
	cd apps/web && yarn build

build-android: install
	cd apps/expo && eas build --platform android

build-ios: install
	cd apps/expo && eas build --platform ios

build-native: install
	cd apps/expo && eas build --platform all

prod-web:
	npx serve web-build

clean:
	yarn cleanup
