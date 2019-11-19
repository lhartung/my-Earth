Building for Android
--------------------

1. `npm install -g ionic@^3.0.0`
2. `npm install -g cordova@^9.0.0`
3. `ionic cordova platform add android`
4. `ionic cordova build android --prod --release`
5. `jarsigner -verbose -keystore <keystore file> platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name`
6. `zipalign 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk myearth.apk`


Debugging with an Android Device
--------------------------------

This will show the console log messages while the app is running, which is
very helpful for debugging.

`ionic run --livereload --consolelogs`


Building for iOS
--------------------

1. `npm install -g ionic@^3.0.0`
2. `npm install -g cordova@^9.0.0`
3. `ionic cordova platform add ios`
4. `open platforms/ios/MyEarth.xcworkspace`
5. Add the appropriate signing key under the build settings.
6. Use xcode to build and test the app.


Google Analytics
----------------

Use version 1.0.0 of cordova-google-analytics-plugin because of this
issue causing App Store rejections.

https://github.com/danwilson/google-analytics-plugin/issues/218
