/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#import "AppDelegate.h"
#import "ViewController.h"
#import "View.h"

#include "platform/ios/IOSPlatform.h"
#import "platform/ios/AppDelegateBridge.h"
#import "platform/apple/JsbBridgeWrapper.h"
#import "service/SDKWrapper.h"
#import "GoogleSignIn/GoogleSignIn.h"
#include "platform/apple/JsbBridge.h"

@implementation AppDelegate
@synthesize window;
@synthesize appDelegateBridge;

#pragma mark -
#pragma mark Application lifecycle

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [[SDKWrapper shared] application:application didFinishLaunchingWithOptions:launchOptions];
    appDelegateBridge = [[AppDelegateBridge alloc] init];
    
    // Add the view controller's view to the window and display.
    CGRect bounds = [[UIScreen mainScreen] bounds];
    self.window   = [[UIWindow alloc] initWithFrame:bounds];
    [SDKWrapper shared].window = self.window;//backup

    // Should create view controller first, cc::Application will use it.
    _viewController                           = [[ViewController alloc] init];
    _viewController.view                      = [[View alloc] initWithFrame:bounds];
    _viewController.view.contentScaleFactor   = UIScreen.mainScreen.scale;
    _viewController.view.multipleTouchEnabled = true;
    [self.window setRootViewController:_viewController];

    [self.window makeKeyAndVisible];
    [appDelegateBridge application:application didFinishLaunchingWithOptions:launchOptions];
    
    //--device id
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
    OnScriptEventListener requestLabelContent = ^void(NSString* arg){
          JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
        if([arg isEqualToString:@"getdeviceid"]) {
            NSLog(@"getdeviceid success...");
            NSString *identifer = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
            [m dispatchEventToScript:@"getdeviceid" arg:identifer];
        } else if([arg isEqualToString:@"getgoogleid"]) {
            NSLog(@"getgoogleid success...");
            [GIDSignIn.sharedInstance signInWithPresentingViewController: [[SDKWrapper shared].window rootViewController]
                                                                completion:^(GIDSignInResult * _Nullable signInResult,
                                                                             NSError * _Nullable error) {
              if (error) { return; }
              if (signInResult == nil) { return; }
  
              GIDGoogleUser *user = signInResult.user;
                [m dispatchEventToScript:@"getdeviceid" arg:user.userID];
//              NSString *emailAddress = user.profile.email;
//              NSString *name = user.profile.name;
//              NSString *givenName = user.profile.givenName;
//              NSString *familyName = user.profile.familyName;
//              NSURL *profilePic = [user.profile imageURLWithDimension:320];
            }];
        } else if([arg isEqualToString:@"getfacebookid"]) {
            
        }
    };
    [m addScriptEventListener:@"javascript_to_java" listener:requestLabelContent];
    
    
    //--google sign in
    [GIDSignIn.sharedInstance restorePreviousSignInWithCompletion:^(GIDGoogleUser * _Nullable user, NSError * _Nullable error) {
       if (error) {
         // Show the app's signed-out state.
           NSLog(@"");
       } else {
         // Show the app's signed-in state.
           NSLog(@"");
       }
    }];
    
//    static ICallback cb = ^void (NSString* _arg0, NSString* _arg1){
//        if([_arg0 isEqual:@"getgoogleid"]){
//            //open Ad
//
//        }
//    };
//
//    JsbBridge* m2 = [JsbBridge sharedInstance];
//    [m2 setCallback:cb];
    return YES;
}
//static ICallback callback = ^void (NSString* _arg0, NSString* _arg1){
//    if([_arg0 isEqual:@"getgoogleid"]){
//        //open Ad
//        [GIDSignIn.sharedInstance signInWithPresentingViewController: 
//                                                            completion:^(GIDSignInResult * _Nullable signInResult,
//                                                                         NSError * _Nullable error) {
//          if (error) { return; }
//          if (signInResult == nil) { return; }
//
//          GIDGoogleUser *user = signInResult.user;
//
//          NSString *emailAddress = user.profile.email;
//
//          NSString *name = user.profile.name;
//          NSString *givenName = user.profile.givenName;
//          NSString *familyName = user.profile.familyName;
//
//          NSURL *profilePic = [user.profile imageURLWithDimension:320];
//      }];
//    }
//};

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  BOOL handled;

  handled = [GIDSignIn.sharedInstance handleURL:url];
  if (handled) {
    return YES;
  }

  // Handle other custom URL types.

  // If not handled by this app, return NO.
  return NO;
}
//- (void)handleGetURLEvent:(NSAppleEventDescriptor *)event
//           withReplyEvent:(NSAppleEventDescriptor *)replyEvent {
//      NSString *URLString = [[event paramDescriptorForKeyword:keyDirectObject] stringValue];
//      NSURL *URL = [NSURL URLWithString:URLString];
//      [GIDSignIn.sharedInstance handleURL:url];
//}
- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    [[SDKWrapper shared] applicationWillResignActive:application];
    [appDelegateBridge applicationWillResignActive:application];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
    [[SDKWrapper shared] applicationDidBecomeActive:application];
    [appDelegateBridge applicationDidBecomeActive:application];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    [[SDKWrapper shared] applicationDidEnterBackground:application];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    [[SDKWrapper shared] applicationWillEnterForeground:application];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    [[SDKWrapper shared] applicationWillTerminate:application];
    [appDelegateBridge applicationWillTerminate:application];
}

#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    [[SDKWrapper shared] applicationDidReceiveMemoryWarning:application];
}

@end
