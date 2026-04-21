# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-21

### Added
- One-click install badge in the README using the `srgbmods.net` bridge URL.
- `Idle Scene ID` setting — send a WIZ built-in scene ID when streaming is
  paused. Changes to the setting are applied live via `onIdleSceneChanged`.
- `Max Updates Per Second` setting — bounds UDP send rate to prevent WIZ
  firmware from dropping packets.
- Device health tracking: each controller records the last time the device
  responded and exposes an `isOnline` flag.
- QML device cards now show an online/offline status dot and dim offline
  devices.

### Changed
- `Publisher` updated to `RobThePCGuy` (fork maintainer). Original plugin by
  GreenSky Productions is credited in the README.
- `Version` bumped to `1.1.0`.
- `WIZProtocol.setPilot` now throttles sends to the configured update rate in
  addition to the existing "skip if unchanged" guard.

### Fixed
- README install link previously pointed to `github.com/yourusername/...` and
  would fail for every user. Now points at the correct repository.

## [1.0.0] - initial

- Automatic device discovery via UDP broadcast
- RGB color control synced with SignalRGB effects
- Brightness control with configurable minimum
- Dim color fallback when effect is black/off
- Optional forced color mode
- Optional color temperature mode for tunable-white bulbs
- Turn off lights on SignalRGB exit
