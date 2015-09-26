# viral
To set up Viral:
* Make sure you have Cordova installed (`npm install -g cordova`)
* `cd viral-app`
* Run `cordova add platform android` and/or `cordova add platform ios`
* Run `cordova plugin add cordova-plugin-geolocation`
* To run on Android:
    * Make sure the Android sdk is installed
    * Build with `cordova build android`
    * Run with `cordova run android` (will run in emulator if no device is connected)
* To run on iOS:
    * Make sure Xcode is installed
    * Build with `cordova build ios`
    * To install emulator, run `npm install -g ios-sim`
    * Emulate with `cordova emulate ios`
    * To run on device, open `viral-app/platforms/ios/CordovaLib/CordovaLib.xcodeproj` in Xcode, and click "run"
