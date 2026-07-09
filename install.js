module.exports = {
  run: [
    {
      when: "{{platform !== 'darwin' || arch !== 'arm64'}}",
      method: "notify",
      params: {
        html: "<b>MacProvider requires an Apple Silicon Mac (M1 or newer) running macOS 14+.</b>"
      },
      next: null
    },
    {
      method: "input",
      params: {
        title: "Install MacProvider",
        description: "Choose the provider handle and fallback model. Install will try to apply the current paid-yield recommendation for this Mac.",
        type: "modal",
        form: [
          {
            key: "provider_id",
            title: "Provider handle",
            description: "Lowercase letters, numbers, and dashes only.",
            placeholder: "pinokio-mac",
            default: "pinokio-mac"
          },
          {
            key: "model",
            title: "Fallback model",
            description: "Used before autotune applies a verified recommendation.",
            default: "mlx-community/Llama-3.2-3B-Instruct-4bit"
          },
          {
            key: "port",
            title: "Local port",
            default: "18080"
          },
          {
            key: "coordinator",
            title: "Coordinator WebSocket",
            default: "wss://coordinator.streamvc.live/ws/provider"
          }
        ]
      }
    },
    {
      method: "local.set",
      params: {
        provider_id: "{{input.provider_id}}",
        model: "{{input.model}}",
        port: "{{input.port}}",
        coordinator: "{{input.coordinator}}"
      }
    },
    {
      method: "shell.run",
      params: {
        conda: { skip: true },
        env: {
          MACPROVIDER_NO_LAUNCHD: "1",
          MACPROVIDER_NO_WATCHDOG: "1",
          MACPROVIDER_NO_PROMPT: "1",
          MACPROVIDER_SKIP_HF_CHECK: "0",
          MACPROVIDER_PROVIDER_ID: "{{local.provider_id}}",
          MACPROVIDER_MODEL: "{{local.model}}",
          MACPROVIDER_PORT: "{{local.port}}",
          MACPROVIDER_COORDINATOR_URL: "{{local.coordinator}}"
        },
        message: [
          "set -euo pipefail",
          "case \"$MACPROVIDER_PROVIDER_ID\" in ''|*[!a-z0-9-]*) echo 'Provider handle must contain only lowercase letters, numbers, and dashes.' >&2; exit 7;; esac",
          "printf '%s' \"$MACPROVIDER_PROVIDER_ID\" | grep -Eq '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' || { echo 'Provider handle must start and end with a lowercase letter or number.' >&2; exit 7; }",
          "case \"$MACPROVIDER_PORT\" in ''|*[!0-9]*) echo 'Port must be numeric.' >&2; exit 7;; esac",
          "if [ \"$MACPROVIDER_PORT\" -lt 1024 ] || [ \"$MACPROVIDER_PORT\" -gt 65535 ]; then echo 'Port must be in [1024, 65535].' >&2; exit 7; fi",
          "mkdir -p \"$HOME/.config/macprovider\"",
          "printf '%s\\n' \"$MACPROVIDER_PROVIDER_ID\" > \"$HOME/.config/macprovider/provider_id\"",
          "chmod 600 \"$HOME/.config/macprovider/provider_id\" 2>/dev/null || true",
          "curl -fsSL https://get.streamvc.live/install.sh | bash",
          "CLI=\"$HOME/.local/bin/macprovider-cli\"",
          "[ -x \"$CLI\" ] || CLI=\"$HOME/macprovider/macprovider-cli\"",
          "[ -x \"$CLI\" ] || { echo 'macprovider-cli was not installed.' >&2; exit 5; }",
          "echo 'Stopping installer self-test process so Pinokio owns the daemon...'",
          "pkill -TERM -f \"$HOME/macprovider/macprovider-cli .*--provider-id $MACPROVIDER_PROVIDER_ID\" 2>/dev/null || true",
          "sleep 2",
          "pkill -KILL -f \"$HOME/macprovider/macprovider-cli .*--provider-id $MACPROVIDER_PROVIDER_ID\" 2>/dev/null || true",
          "echo 'Applying current paid-yield recommendation when available...'",
          "\"$CLI\" autotune --recommend --apply --config \"$HOME/.config/macprovider/config.yaml\" || echo 'Recommendation unavailable; keeping fallback model.'",
          "echo 'Warming configured model with self-test...'",
          "\"$CLI\" self-test --config \"$HOME/.config/macprovider/config.yaml\"",
          "echo 'Install complete. Use Start to join the StreamVC coordinator as a Pinokio-managed daemon.'"
        ]
      }
    }
  ]
}
