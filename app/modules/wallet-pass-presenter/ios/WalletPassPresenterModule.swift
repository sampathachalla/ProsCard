import ExpoModulesCore
import PassKit

final class WalletPassDownloadException: GenericException<String> {
  override var reason: String { "Could not download the Apple Wallet pass: \(param)" }
}

final class WalletPassInvalidException: Exception {
  override var reason: String { "The downloaded Apple Wallet pass is invalid." }
}

final class WalletPassPresentationException: Exception {
  override var reason: String { "ProsCard could not present the Apple Wallet screen." }
}

final class WalletPassInProgressException: Exception {
  override var reason: String { "Another Apple Wallet pass is already being presented." }
}

public final class WalletPassPresenterModule: Module, PKAddPassesViewControllerDelegate {
  private var pendingPromise: Promise?
  private var pendingPass: PKPass?

  public func definition() -> ModuleDefinition {
    Name("WalletPassPresenter")

    AsyncFunction("presentAsync") { (url: URL, promise: Promise) in
      guard self.pendingPromise == nil else {
        promise.reject(WalletPassInProgressException())
        return
      }
      self.pendingPromise = promise

      URLSession.shared.dataTask(with: url) { data, response, error in
        if let error {
          self.finishWithError(WalletPassDownloadException(error.localizedDescription))
          return
        }
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode), let data else {
          self.finishWithError(WalletPassDownloadException("The server did not return a pass."))
          return
        }
        do {
          let pass = try PKPass(data: data)
          DispatchQueue.main.async { self.present(pass) }
        } catch {
          self.finishWithError(WalletPassInvalidException())
        }
      }.resume()
    }
  }

  private func present(_ pass: PKPass) {
    guard
      let parent = appContext?.utilities?.currentViewController(),
      let controller = PKAddPassesViewController(pass: pass)
    else {
      finishWithError(WalletPassPresentationException())
      return
    }
    pendingPass = pass
    controller.delegate = self
    parent.present(controller, animated: true)
  }

  public func addPassesViewControllerDidFinish(_ controller: PKAddPassesViewController) {
    let added = pendingPass.map { PKPassLibrary().containsPass($0) } ?? false
    controller.dismiss(animated: true) {
      self.pendingPromise?.resolve(["added": added])
      self.pendingPromise = nil
      self.pendingPass = nil
    }
  }

  private func finishWithError(_ error: Exception) {
    DispatchQueue.main.async {
      self.pendingPromise?.reject(error)
      self.pendingPromise = nil
      self.pendingPass = nil
    }
  }
}
