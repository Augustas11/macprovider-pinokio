const fs = require("fs")
const os = require("os")
const path = require("path")

const CONFIG_PATH = path.join(os.homedir(), ".config", "macprovider", "config.yaml")
const PROVIDER_ID_PATH = path.join(os.homedir(), ".config", "macprovider", "provider_id")
const BIN_PATH = path.join(os.homedir(), ".local", "bin", "macprovider-cli")
const SUPPORT_BIN_PATH = path.join(os.homedir(), "macprovider", "macprovider-cli")

function exists(file) {
  try {
    fs.accessSync(file, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

function readProviderID() {
  try {
    return fs.readFileSync(PROVIDER_ID_PATH, "utf8").trim()
  } catch (e) {
    return ""
  }
}

function isRunning(info, kernel, script) {
  if (info && typeof info.running === "function") return info.running(script)
  if (kernel && typeof kernel.running === "function") return kernel.running(__dirname, script)
  return false
}

module.exports = {
  version: "1.0",
  title: "MacProvider",
  description: "Host open models on idle Apple Silicon and earn USDC.",
  icon: "icon.svg",
  menu: async (kernel, info) => {
    const platform = (kernel && kernel.platform) || os.platform()
    const arch = (kernel && kernel.arch) || os.arch()
    const installed = (exists(BIN_PATH) || exists(SUPPORT_BIN_PATH)) && exists(CONFIG_PATH)
    const installing = isRunning(info, kernel, "install.js")
    const starting = isRunning(info, kernel, "start.js")
    const uninstalling = isRunning(info, kernel, "uninstall.js")
    const providerID = readProviderID()

    if (platform !== "darwin" || arch !== "arm64") {
      return [{
        default: true,
        icon: "fa-solid fa-circle-exclamation",
        text: "Requires Apple Silicon macOS"
      }]
    }

    if (installing) {
      return [{ default: true, icon: "fa-solid fa-plug fa-spin", text: "Installing", href: "install.js" }]
    }

    if (uninstalling) {
      return [{ default: true, icon: "fa-solid fa-trash fa-spin", text: "Uninstalling", href: "uninstall.js" }]
    }

    if (!installed) {
      return [{
        default: true,
        icon: "fa-solid fa-plug",
        text: "Install",
        href: "install.js",
        params: { fullscreen: true, run: true }
      }]
    }

    if (starting) {
      const label = providerID ? `Running (${providerID})` : "Running"
      return [
        { default: true, icon: "fa-solid fa-terminal", text: label, href: "start.js" },
        { icon: "fa-solid fa-chart-line", text: "Status", href: "status.js", params: { fullscreen: true, run: true } },
        { icon: "fa-solid fa-stop", text: "Stop", href: "stop.js", params: { fullscreen: true, run: true } }
      ]
    }

    const menu = [
      { default: true, icon: "fa-solid fa-power-off", text: "Start", href: "start.js", params: { fullscreen: true, run: true } },
      { icon: "fa-solid fa-chart-line", text: "Status", href: "status.js", params: { fullscreen: true, run: true } },
      { icon: "fa-solid fa-rotate", text: "Refresh Recommendation", href: "recommend.js", params: { fullscreen: true, run: true } },
      { icon: "fa-solid fa-trash", text: "Uninstall", href: "uninstall.js", params: { fullscreen: true, run: true } }
    ]

    if (providerID) {
      menu.unshift({ icon: "fa-solid fa-circle-info", text: `Provider ${providerID}` })
    }

    return menu
  }
}
