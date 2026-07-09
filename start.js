module.exports = {
  daemon: true,
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
      method: "shell.run",
      params: {
        conda: { skip: true },
        message: [
          "set -euo pipefail",
          "CONFIG=\"$HOME/.config/macprovider/config.yaml\"",
          "PROVIDER_ID_FILE=\"$HOME/.config/macprovider/provider_id\"",
          "CLI=\"$HOME/.local/bin/macprovider-cli\"",
          "[ -x \"$CLI\" ] || CLI=\"$HOME/macprovider/macprovider-cli\"",
          "[ -x \"$CLI\" ] || { echo 'macprovider-cli not found. Run Install first.' >&2; exit 5; }",
          "[ -f \"$CONFIG\" ] || { echo \"Missing $CONFIG. Run Install first.\" >&2; exit 5; }",
          "read_yaml() { awk -F: -v key=\"$1\" '$1 == key { value=$0; sub(\"^[^:]+:[[:space:]]*\", \"\", value); gsub(/^\\\"|\\\"$/, \"\", value); print value; exit }' \"$CONFIG\"; }",
          "PORT=\"$(read_yaml port)\"",
          "MODEL=\"$(read_yaml model)\"",
          "COORDINATOR=\"$(read_yaml coordinator_url)\"",
          "PROVIDER_ID=\"$(cat \"$PROVIDER_ID_FILE\" 2>/dev/null || read_yaml provider_id)\"",
          "PORT=\"${PORT:-18080}\"",
          "COORDINATOR=\"${COORDINATOR:-wss://coordinator.streamvc.live/ws/provider}\"",
          "[ -n \"$MODEL\" ] || { echo 'Config is missing model.' >&2; exit 5; }",
          "[ -n \"$PROVIDER_ID\" ] || { echo 'Config is missing provider_id.' >&2; exit 5; }",
          "echo \"Starting MacProvider provider_id=$PROVIDER_ID model=$MODEL port=$PORT coordinator=$COORDINATOR\"",
          "exec \"$CLI\" serve --port \"$PORT\" --model \"$MODEL\" --provider-id \"$PROVIDER_ID\" --coordinator \"$COORDINATOR\""
        ],
        on: [
          { event: "/Listening on http:\\/\\/127\\.0\\.0\\.1:[0-9]+/", done: true }
        ]
      }
    },
    {
      method: "local.set",
      params: {
        url: "{{input.event[0].match(/http:\\/\\/127\\.0\\.0\\.1:[0-9]+/)[0]}}"
      }
    }
  ]
}
