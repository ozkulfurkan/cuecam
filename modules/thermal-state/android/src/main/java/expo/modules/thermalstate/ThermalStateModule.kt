package expo.modules.thermalstate

import android.content.Context
import android.os.Build
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val THERMAL_STATE_CHANGED = "onThermalStateChange"

/**
 * Reports the phone's thermal status (PowerManager, API 29+) as one of the
 * shared states "nominal" | "fair" | "serious" | "critical" | "unknown".
 * Older Android versions have no public API and always report "unknown".
 */
class ThermalStateModule : Module() {
  private var listener: Any? = null

  private val powerManager: PowerManager?
    get() = appContext.reactContext?.getSystemService(Context.POWER_SERVICE) as? PowerManager

  override fun definition() = ModuleDefinition {
    Name("ThermalState")

    Events(THERMAL_STATE_CHANGED)

    Function("getThermalState") {
      return@Function currentState()
    }

    OnStartObserving {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val manager = powerManager ?: return@OnStartObserving
        val statusListener = PowerManager.OnThermalStatusChangedListener { status ->
          sendEvent(THERMAL_STATE_CHANGED, mapOf("state" to stateName(status)))
        }
        manager.addThermalStatusListener(statusListener)
        listener = statusListener
      }
    }

    OnStopObserving {
      removeListener()
    }

    OnDestroy {
      removeListener()
    }
  }

  private fun removeListener() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val statusListener = listener as? PowerManager.OnThermalStatusChangedListener ?: return
      powerManager?.removeThermalStatusListener(statusListener)
    }
    listener = null
  }

  private fun currentState(): String {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return "unknown"
    val manager = powerManager ?: return "unknown"
    return stateName(manager.currentThermalStatus)
  }

  // Android has seven levels; they are folded into iOS's four so the app
  // handles one scale.
  private fun stateName(status: Int): String = when (status) {
    PowerManager.THERMAL_STATUS_NONE -> "nominal"
    PowerManager.THERMAL_STATUS_LIGHT -> "fair"
    PowerManager.THERMAL_STATUS_MODERATE -> "serious"
    PowerManager.THERMAL_STATUS_SEVERE,
    PowerManager.THERMAL_STATUS_CRITICAL,
    PowerManager.THERMAL_STATUS_EMERGENCY,
    PowerManager.THERMAL_STATUS_SHUTDOWN -> "critical"
    else -> "unknown"
  }
}
