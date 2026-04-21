# SignalRGB WIZ Network Plugin

Control WIZ smart lights (Philips/Signify) through SignalRGB.

## Requirements

- WIZ smart lights on a 2.4GHz WiFi network
- Local UDP communication enabled in the WIZ app

## Features

- Automatic device discovery via UDP broadcast
- RGB color control synced with SignalRGB effects
- Brightness control with configurable minimum
- Dim color fallback when effect is black/off
- Optional forced color mode
- Optional WIZ built-in scene when SignalRGB is idle
- Rate-limited packet sending to prevent WIZ firmware drops
- Offline device detection
- Turn off lights on SignalRGB exit

## Installation

[![Add to SignalRGB](https://raw.githubusercontent.com/SRGBmods/QMK-Images/main/images/add-to-signalrgb.png)](https://srgbmods.net/s?p=addon/install?url=https://github.com/RobThePCGuy/SignalRGB-WIZ-Network-Plugin)

Or manually: copy `WIZ.js` and `WIZ.qml` to your SignalRGB plugins folder and restart SignalRGB.

## Settings

| Setting | Description |
|---------|-------------|
| Automatically Start Stream | Enable/disable color streaming to device |
| Turn off on App Exit | Turn off lights when SignalRGB closes |
| Force Color | Override effect with a fixed color |
| Forced Color | The color to use when Force Color is enabled |
| Minimum Brightness | Lowest brightness level (1-100%) |
| Color when dimmed | Color shown when effect outputs black |
| Use Color Temperature | Send temperature instead of RGB (RGB-TW hybrid bulbs) |
| Color Temperature (K) | Kelvin value used when color temperature mode is on |
| Idle Scene ID | WIZ built-in scene used while streaming is paused (0 = disabled, applied live) |
| Max Update Rate | Upper bound on packets per second sent to each device |

## How It Works

1. Plugin broadcasts UDP discovery packets every 60 seconds
2. WIZ devices respond with their configuration
3. Devices are added to SignalRGB as controllable components
4. Color data is sent via the WIZ setPilot UDP protocol

## Supported Devices

The plugin works with any WIZ RGB or RGBW device. Tunable White (TW) devices have limited support (no color control).

## Known Limitations

- Single LED per device (no segment control for LED strips)
- No device grouping support

## Troubleshooting

**Devices not discovered:**
- Ensure devices are on 2.4GHz WiFi (not 5GHz)
- Enable local network control in the WIZ app
- Check firewall allows UDP ports 38899/38900

**Colors not updating:**
- Verify "Automatically Start Stream" is enabled
- Check device appears in SignalRGB device list

## Credits

- Original plugin by GreenSky Productions
- Based on the [SignalRGB Govee Plugin](https://gitlab.com/signalrgb/Govee)
- WIZ protocol info from [openHAB WIZ Binding](https://github.com/openhab/openhab-addons)
