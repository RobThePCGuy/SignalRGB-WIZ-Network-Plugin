export function Name() { return "WIZ Interface"; }
export function Version() { return "1.0.0"; }
export function VendorId() { return 0x0; }
export function ProductId() { return 0x0; }
export function Type() { return "network"; }
export function Publisher() { return "GreenSky Productions"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() { return [75, 70]; }
export function DefaultScale() { return 10.0; }
export function DefaultComponentBrand() { return "WIZ"; }
export function SubdeviceController() { return false; }

/* global
controller:readonly
discovery:readonly
TurnOffOnShutdown:readonly
AutoStartStream:readonly
forceColor:readonly
forcedColor:readonly
minBrightness:readonly
dimmColor:readonly
colorTemp:readonly
useColorTemp:readonly
*/

export function ControllableParameters() {
	return [
		{"property": "AutoStartStream", "group": "settings", "label": "Automatically Start Stream", "type": "boolean", "default": "true"},
		{"property": "TurnOffOnShutdown", "group": "settings", "label": "Turn off on App Exit", "type": "boolean", "default": "false"},
		{"property": "forceColor", "group": "settings", "label": "Force Color", "type": "boolean", "default": "false"},
		{"property": "forcedColor", "group": "lighting", "label": "Forced Color", "min": "0", "max": "360", "type": "color", "default": "#009bde"},
		{"property": "minBrightness", "group": "lighting", "label": "Minimum Brightness", "min": "1", "max": "100", "type": "number", "default": "10"},
		{"property": "dimmColor", "group": "lighting", "label": "Color when dimmed", "min": "0", "max": "360", "type": "color", "default": "#010101"},
		{"property": "useColorTemp", "group": "lighting", "label": "Use Color Temperature", "type": "boolean", "default": "false"},
		{"property": "colorTemp", "group": "lighting", "label": "Color Temperature (K)", "min": "2200", "max": "6500", "type": "number", "default": "4000"},
	];
}

// State
let wizProtocol = null;
let lastBroadcast = 0;
let discoveryAttempts = 0;
const BROADCAST_INTERVAL = 60000;
const INITIAL_DISCOVERY_INTERVAL = 3000;
const MAX_INITIAL_ATTEMPTS = 5;
const WIZ_PORT = 38900;

// Device Library - Common WIZ module names
const WIZDeviceLibrary = {
	"ESP03_SHRGB3_01ABI": {
		productName: "WRGB LED Strip",
		imageUrl: "https://www.assets.signify.com/is/image/Signify/WiFi-BLE-LEDstrip-2M-1600lm-startkit-SPP?wid=200&hei=200&qlt=100",
	},
	"ESP15_SHTW1C_01": {
		productName: "Tunable White Bulb",
		imageUrl: "https://www.assets.signify.com/is/image/PhilipsLighting/929002383532-?",
	},
	"ESP01_SHRGB1C_31": {
		productName: "RGB Bulb A19",
		imageUrl: "https://www.assets.signify.com/is/image/Signify/046677603548-?"
	},
	"ESP01_SHRGBC_01": {
		productName: "RGB Bulb",
		imageUrl: "https://www.assets.signify.com/is/image/Signify/046677603548-?"
	},
	"ESP56_SHTW3_01": {
		productName: "Tunable White BR30",
		imageUrl: "https://www.assets.signify.com/is/image/PhilipsLighting/929002383532-?"
	},
	"ESP17_SHTW9_01": {
		productName: "Tunable White A21",
		imageUrl: "https://www.assets.signify.com/is/image/PhilipsLighting/929002383532-?"
	},
	"ESP03_SHRGB1W_01": {
		productName: "RGBW Bulb",
		imageUrl: "https://www.assets.signify.com/is/image/Signify/046677603548-?"
	}
};

// Lifecycle
export function Initialize() {
	device.addFeature("udp");
	device.setName(`WIZ ${controller.modelName || "Device"} Room: ${controller.roomId || "Unknown"}`);

	if (controller.isTW) {
		device.removeProperty("forcedColor");
		device.removeProperty("forceColor");
	}

	device.setSize(1, 1);
	device.setControllableLeds(["LED 1"], [[0, 0]]);

	wizProtocol = new WIZProtocol(controller.ip, controller.port || WIZ_PORT, controller.isTW);
}

export function Render() {
	if (!AutoStartStream) return;

	const color = forceColor ? hexToRgb(forcedColor) : device.color(0, 0);
	wizProtocol.setPilot(color[0], color[1], color[2]);
}

export function Shutdown() {
	if (TurnOffOnShutdown && wizProtocol) {
		wizProtocol.setState(false);
	}
}

// Helpers
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return [0, 0, 0];
	return [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	];
}

function safeJsonParse(str, fallback = null) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return fallback;
	}
}

// Discovery Service
export function DiscoveryService() {
	this.IconUrl = "https://play-lh.googleusercontent.com/jhmzIodqBLQQUD2sJF_O6oawa04ocDFfQIgoH0rPOXQY3V1uVz0-FJvEieFjVO-kcJ8=w200-h200-rw";
	this.UdpBroadcastPort = 38899;
	this.UdpBroadcastAddress = "255.255.255.255";
	this.UdpListenPort = WIZ_PORT;

	this.Initialize = function() {
		service.log("WIZ Plugin: Searching for devices...");
	};

	this.CheckForDevices = function() {
		service.broadcast(JSON.stringify({
			method: "registration",
			params: {
				phoneMac: "AAAAAAAAAAAA",
				register: false,
				phoneIp: "1.2.3.4",
				id: "1"
			}
		}));
	};

	this.Update = function() {
		for (const cont of service.controllers) {
			cont.obj.update();
		}

		const now = Date.now();
		const interval = discoveryAttempts < MAX_INITIAL_ATTEMPTS
			? INITIAL_DISCOVERY_INTERVAL
			: BROADCAST_INTERVAL;

		if (now - lastBroadcast >= interval) {
			lastBroadcast = now;
			discoveryAttempts++;
			this.CheckForDevices();
		}
	};

	this.Shutdown = function() {};

	this.Discovered = function(value) {
		const packet = safeJsonParse(value.response);
		if (!packet) {
			service.log("WIZ: Failed to parse discovery response");
			return;
		}

		switch (packet.method) {
			case "registration":
				if (packet.result?.success) {
					this.CreateController(value);
				}
				break;
			case "getSystemConfig":
				const ctrl = service.getController(value.id);
				if (ctrl) {
					ctrl.setDeviceInfo(packet.result);
				}
				break;
		}
	};

	this.Removal = function() {};

	this.CreateController = function(value) {
		const existing = service.getController(value.id);
		if (!existing) {
			service.addController(new WIZDevice(value));
		} else {
			existing.updateWithValue(value);
		}
	};
}

// WIZ Device Controller
class WIZDevice {
	constructor(value) {
		this.id = value.id;
		this.ip = value.ip;
		this.port = value.port || WIZ_PORT;
		this.configRetries = 0;
		this.lastConfigRequest = 0;
		this.deviceInfoLoaded = false;
		this.announced = false;
		this.wiztype = null;

		// Device info
		this.homeId = 0;
		this.fwVersion = "Unknown";
		this.roomId = 0;
		this.groupId = 0;
		this.modelName = "Unknown";
		this.isRGB = false;
		this.isTW = false;
	}

	updateWithValue(value) {
		const data = safeJsonParse(value.response);
		if (data) {
			if (data.ip) this.ip = data.ip;
			if (data.port) this.port = data.port;
		}
	}

	setDeviceInfo(data) {
		if (this.deviceInfoLoaded) return;

		this.homeId = data.homeId || data.homeid || 0;
		this.fwVersion = data.fwVersion || "Unknown";
		this.roomId = data.roomId || 0;
		this.groupId = data.groupId || 0;
		this.modelName = data.moduleName || "Unknown";
		this.isRGB = this.modelName.includes("RGB");
		this.isTW = this.modelName.includes("TW");
		this.deviceInfoLoaded = true;

		if (WIZDeviceLibrary[this.modelName]) {
			this.wiztype = WIZDeviceLibrary[this.modelName];
		}

		service.updateController(this);
	}

	update() {
		const now = Date.now();

		// Request system config if not loaded (with retry logic)
		if (!this.deviceInfoLoaded && this.configRetries < 3) {
			if (now - this.lastConfigRequest > 2000) {
				this.lastConfigRequest = now;
				this.configRetries++;
				service.broadcast(JSON.stringify({method: "getSystemConfig", id: 1}), this.ip);
			}
		}

		if (this.deviceInfoLoaded && !this.announced) {
			service.updateController(this);
			service.announceController(this);
			this.announced = true;
		}
	}
}

// WIZ Protocol Handler
class WIZProtocol {
	constructor(ip, port, isTW) {
		this.ip = ip;
		this.port = port;
		this.isTW = isTW;
		this.lastState = {r: -1, g: -1, b: -1, brightness: -1, temp: -1};
	}

	setPilot(r, g, b) {
		const brightness = device.getBrightness ? device.getBrightness() : 100;
		const {lastState} = this;

		// Use color temperature mode for TW-only devices or when user enables it
		if (this.isTW || useColorTemp) {
			const temp = colorTemp || 4000;

			// Skip if unchanged
			if (lastState.temp === temp && lastState.brightness === brightness) {
				return;
			}

			Object.assign(lastState, {r: -1, g: -1, b: -1, brightness, temp});

			// Use dim brightness when off/black
			const isOff = r < 1 && g < 1 && b < 1;
			const finalBrightness = isOff ? (minBrightness || 10) : brightness;

			this.send({
				method: "setPilot",
				params: {temp, dimming: finalBrightness}
			});
			return;
		}

		// RGB mode
		// Skip if unchanged
		if (lastState.r === r && lastState.g === g && lastState.b === b && lastState.brightness === brightness) {
			return;
		}

		Object.assign(lastState, {r, g, b, brightness, temp: -1});

		// Use dim color when off/black
		const isOff = r < 1 && g < 1 && b < 1;
		const [finalR, finalG, finalB] = isOff ? hexToRgb(dimmColor) : [r, g, b];
		const finalBrightness = isOff ? (minBrightness || 10) : brightness;

		this.send({
			method: "setPilot",
			params: {r: finalR, g: finalG, b: finalB, dimming: finalBrightness}
		});
	}

	setState(on) {
		this.send({method: "setPilot", params: {state: on}});
	}

	send(command) {
		try {
			udp.send(this.ip, this.port, JSON.stringify(command));
		} catch (e) {
			device.log(`WIZ: Send error - ${e}`);
		}
	}
}

export function Image() {
	return "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";
}
