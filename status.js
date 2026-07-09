module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        conda: { skip: true },
        message: [
          "set -euo pipefail",
          "CLI=\"$HOME/.local/bin/macprovider-cli\"",
          "[ -x \"$CLI\" ] || CLI=\"$HOME/macprovider/macprovider-cli\"",
          "[ -x \"$CLI\" ] || { echo 'macprovider-cli not found. Run Install first.' >&2; exit 5; }",
          "\"$CLI\" status"
        ]
      }
    }
  ]
}
