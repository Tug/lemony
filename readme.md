# Diversified App Monorepo

## [Universal App](/packages/app/README.md)

Diversified is a personal investment platform ✨

- Web: [app.diversified.fi](https://app.diversified.fi)
- iOS: [apps.apple.com/app/apple-store/id6446693590]()
- Android: [play.google.com/store/apps/details?id=fi.diversified.app](https://play.google.com/store/apps/details?id=fi.diversified)

## Get Started

- Decrypt secrets: `ENV_SECRET_PASSPHRASE=xxx SERVICE_ACCOUNT_KEY_SECRET_PASSPHRASE=yyy GOOGLE_SERVICES_SECRET_PASSPHRASE=zzz bash scripts/decrypt-secrets.sh `
- Run web server: `cd apps/next && yarn dev`
- Run iOS app: `cd apps/expo && yarn ios`
- Run Android app: `cd apps/expo && yarn android`
- Build & publish mobile apps `yarn build:production` then `yarn submit:ios` and `yarn submit:android`

## [Universal Design System](/packages/design-system/README.md)

Universal is a design system created by Showtime to help teams build high-quality
digital experiences for iOS, Android, and the Web.

- Storybook: [universal.showtime.xyz](https://universal.showtime.xyz)
- Bit: [bit.cloud/showtime/universal](https://bit.cloud/showtime/universal)
- npm: [npmjs.com/org/showtime-xyz](https://npmjs.com/org/showtime-xyz)
- Figma: [figma.com/file/hseAlaaQKC4b7MIZS6TdF9](https://figma.com/file/hseAlaaQKC4b7MIZS6TdF9)

## 📦 Included packages

-   `solito` for cross-platform navigation
-   `moti` for animations
-   `dripsy` for theming/design (you can bring your own, too)
-   Expo SDK 44
-   Next.js 12
-   React Navigation 6

## 🗂 Folder layout

-   `apps` entry points for each app

    -   `expo`
    -   `next`

-   `packages` shared packages across apps
    -   `app` you'll be importing most files from `app/`
        -   `features` (don't use a `screens` folder. organize by feature.)
        -   `provider` (all the providers that wrap the app, and some no-ops for Web.)
        -   `navigation` Next.js has a `pages/` folder. React Native doesn't. This folder contains navigation-related code for RN. You may use it for any navigation code, such as custom links.

You can add other folders inside of `packages/` if you know what you're doing and have a good reason to.

## 🏁 Start the app

-   Install dependencies: `yarn`

-   Next.js local dev: `yarn web`
    -   Runs `yarn next`
-   Expo local dev: `yarn native`
    -   Runs `expo start`

## 🧑‍🔧 Build the app

-   For iOS: `yarn ios`

-   For Android: `yarn android`

## 📱 Test the app
- Create a new account by signing up
- Edit your profile in the database using a tool like DBeaver:
  - Set your `role` to 'ADMIN'
  - Set your `kycStatus` to 'completed'

## Troubleshooting

### In simulator: `Disconnected from Metro (1001: "Stream end encountered")`

Restart the app. Press `i` for iOS or `a` for Android.

### Error when running `prisma generate`: `assertion failed [block != nullptr]: BasicBlock requested for unrecognized address`

Solution: start your shell with `arch -x86_64 zsh` (or `arch -x86_64 fish` if you're using fish)

## 🆕 Add new dependencies

### Pure JS dependencies

If you're installing a JavaScript-only dependency that will be used across platforms, install it in `packages/app`:

```sh
cd packages/app
yarn add date-fns
cd ../..
yarn
```

### Native dependencies

If you're installing a library with any native code, you must install it in `apps/expo`:

```sh
cd apps/expo
yarn add react-native-reanimated

cd ../..
yarn
```

You can also install the native library inside of `packages/app` if you want to get autoimport for that package inside of the `app` folder. However, you need to be careful and install the _exact_ same version in both packages. If the versions mismatch at all, you'll potentially get terrible bugs. This is a classic monorepo issue. I use `lerna-update-wizard` to help with this (you don't need to use Lerna to use that lib).

## 🎙 About the creator

Follow Fernando Rojo on Twitter: [@FernandoTheRojo](https://twitter.com/fernandotherojo)

## 🧐 Why use Expo + Next.js?

See my talk about this topic at Next.js Conf 2021:

<a href="https://www.youtube.com/watch?v=0lnbdRweJtA"><img width="1332" alt="image" src="https://user-images.githubusercontent.com/13172299/157299915-b633e083-f271-48c6-a262-7b7eef765be5.png">
</a>


## Useful commands

Debug deep link urls in development:
- `npx uri-scheme open "fi.diversified.app.development://onboarding/sign-up?code=AAAAA" --ios`