# MacProvider for Pinokio

MacProvider turns an idle Apple Silicon Mac into a paid MLX provider endpoint for the StreamVC network. This repository is a one-click Pinokio launcher: paste the repo URL into Pinokio, click Install, then click Start.

## Requirements

- Apple Silicon Mac (M1 or newer)
- macOS 14+
- Pinokio
- Enough free disk space for the selected MLX model

MacProvider is supply-side infrastructure. It is not a private-inference guarantee: provider machines receive plaintext prompts for requests they serve.

## What The Launcher Does

The launcher uses the Pinokio-managed daemon model. `install.js` runs the public MacProvider installer with launchd and watchdog disabled:

```bash
MACPROVIDER_NO_LAUNCHD=1 MACPROVIDER_NO_WATCHDOG=1 MACPROVIDER_NO_PROMPT=1 \
  curl -fsSL https://get.streamvc.live/install.sh | bash
```

That keeps Pinokio as the owner of the long-running process, so Pinokio Start and Stop map to the provider daemon cleanly. The installer may briefly start MacProvider for its own self-test; the launcher stops that temporary process and then runs `macprovider-cli self-test` to warm the configured model before Start.

`start.js` runs the foreground provider:

```bash
macprovider-cli serve --port <PORT> --model <MODEL_ID> --provider-id <HANDLE> \
  --coordinator wss://coordinator.streamvc.live/ws/provider
```

## Menu

- Install: installs `macprovider-cli`, writes `~/.config/macprovider/config.yaml`, applies the paid-yield recommendation when available, and warms the model.
- Start: runs MacProvider as a Pinokio-tracked daemon.
- Stop: stops the Pinokio daemon.
- Status: runs `macprovider-cli status`.
- Refresh Recommendation: reruns `macprovider-cli autotune --recommend --apply` and warms the resulting model.
- Uninstall: stops the Pinokio daemon and runs `macprovider-cli uninstall`. This removes the normal MacProvider install/config for the current macOS user, not only the Pinokio wrapper.

## Install From URL

Use Pinokio's "Download from URL" flow with:

```text
https://github.com/Augustas11/macprovider-pinokio.git
```

## Verification Notes

After Start, `macprovider-cli status` should show:

- Local status `ready`
- Coordinator connected `yes`
- Coordinator URL `wss://coordinator.streamvc.live/ws/provider`

For pool visibility, check the StreamVC portal or coordinator pool endpoint for the configured provider handle.
