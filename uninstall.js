module.exports = {
  run: [
    {
      method: "script.stop",
      params: {
        uri: "start.js"
      }
    },
    {
      method: "shell.run",
      params: {
        conda: { skip: true },
        message: [
          "set -euo pipefail",
          "CLI=\"$HOME/.local/bin/macprovider-cli\"",
          "[ -x \"$CLI\" ] || CLI=\"$HOME/macprovider/macprovider-cli\"",
          "if [ -x \"$CLI\" ]; then \"$CLI\" uninstall; else echo 'macprovider-cli already absent.'; fi"
        ]
      }
    }
  ]
}
