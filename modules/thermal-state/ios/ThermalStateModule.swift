import ExpoModulesCore
import Foundation

private let thermalStateChanged = "onThermalStateChange"

/// Reports `ProcessInfo.thermalState` as "nominal" | "fair" | "serious" |
/// "critical" (same scale as the Android side).
public class ThermalStateModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ThermalState")

    Events(thermalStateChanged)

    Function("getThermalState") { () -> String in
      return ThermalStateModule.stateName(ProcessInfo.processInfo.thermalState)
    }

    OnStartObserving {
      self.removeObserver()
      self.observer = NotificationCenter.default.addObserver(
        forName: ProcessInfo.thermalStateDidChangeNotification,
        object: nil,
        queue: nil
      ) { [weak self] _ in
        self?.sendEvent(thermalStateChanged, [
          "state": ThermalStateModule.stateName(ProcessInfo.processInfo.thermalState)
        ])
      }
    }

    OnStopObserving {
      self.removeObserver()
    }

    OnDestroy {
      self.removeObserver()
    }
  }

  private func removeObserver() {
    if let observer = observer {
      NotificationCenter.default.removeObserver(observer)
    }
    observer = nil
  }

  static func stateName(_ state: ProcessInfo.ThermalState) -> String {
    switch state {
    case .nominal: return "nominal"
    case .fair: return "fair"
    case .serious: return "serious"
    case .critical: return "critical"
    @unknown default: return "unknown"
    }
  }
}
