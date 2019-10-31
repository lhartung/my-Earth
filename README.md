Building for Android
--------------------

1. `npm install -g ionic@^3.0.0`
2. `cordova platform add android`
3. `cp google-services.json platforms/android/app/`
4. `ionic cordova build android --prod --release`
5. `jarsigner -verbose -keystore <keystore file> platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name`
6. `zipalign 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk myearth.apk`


Debugging with an Android Device
--------------------------------

This will show the console log messages while the app is running, which is
very helpful for debugging.

`ionic run --livereload --consolelogs`


Google Analytics
----------------

Use version 1.0.0 of cordova-google-analytics-plugin because of this
issue causing App Store rejections.

https://github.com/danwilson/google-analytics-plugin/issues/218
