# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Backend integration

Copy `.env.example` to a local `.env` and set both backend URLs:

- `EXPO_PUBLIC_LOCAL_API_URL`: the local Docker API. Use your computer's LAN address when
  running on a physical device.
- `EXPO_PUBLIC_OCI_API_URL`: the API deployed on the OCI instance.

Choose which one the app uses by flipping `USE_OCI_BACKEND` in `services/api/config.ts`
(`false` = local, `true` = OCI), then restart Expo with `npx expo start -c` so the change is
picked up. Each value may be either the server root (`http://192.168.1.10:8050`) or the
versioned API root (`http://192.168.1.10:8050/api/v1`).

Authentication test mode is opt-in with `EXPO_PUBLIC_AUTH_TEST_MODE=true`. Normally,
the backend is authoritative for sessions, profiles, onboarding drafts, cards, and OCI
media. AsyncStorage stores the current session and local caches; it is not the source
of truth.

Password recovery uses `/auth/reset-password` on web and the `proscard://auth/reset-password`
deep link in native builds. The matching URL must be configured as
`PASSWORD_RESET_REDIRECT_URL` in the API and allowed in Supabase Auth settings.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
