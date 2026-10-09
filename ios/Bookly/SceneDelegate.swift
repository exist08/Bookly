import UIKit
import React

/// Owns Bookly's window. React Native is started here instead of in
/// AppDelegate so the app launches under the iOS 27 scene requirement.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard
      let windowScene = scene as? UIWindowScene,
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let factory = appDelegate.reactNativeFactory
    else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    // Cold-start deep link (bookly://p/<id>) so Linking.getInitialURL() still sees it.
    var launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions = [.url: url]
    } else if let activity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }) {
      launchOptions = [.userActivityDictionary: [
        "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": activity,
      ]]
    }

    factory.startReactNative(
      withModuleName: "Bookly", // must match "name" in app.json
      in: window,
      launchOptions: launchOptions
    )
  }

  // Warm custom-scheme links (was application(_:open:options:)).
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let context = URLContexts.first else { return }
    // Google Sign-In redirect (com.googleusercontent.apps.…) — let the SDK consume it.
    if GIDSignIn.sharedInstance.handle(context.url) { return }
    var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    if let source = context.options.sourceApplication {
      options[.sourceApplication] = source
    }
    RCTLinkingManager.application(UIApplication.shared, open: context.url, options: options)
  }

  // Warm universal links, e.g. https://bookly.app/p/<id> (was application(_:continue:restorationHandler:)).
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(UIApplication.shared, continue: userActivity) { _ in }
  }
}
