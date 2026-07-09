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
        message: "echo 'MacProvider Pinokio daemon stopped.'"
      }
    }
  ]
}
