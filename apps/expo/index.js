import './shim';

import { registerRootComponent } from 'expo';
import 'expo-dev-client';
import 'expo-dev-launcher';
// import { activateKeepAwake } from "expo-keep-awake";
import 'expo/build/Expo.fx';
import 'react-native-gesture-handler';
import App from './App';

import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/fr';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/fr';

// if (__DEV__) {
//   activateKeepAwake();
// }

registerRootComponent(App);
