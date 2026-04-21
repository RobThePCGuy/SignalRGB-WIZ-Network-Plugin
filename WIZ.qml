Item {
    anchors.fill: parent

    // Instructions Panel
    Rectangle {
        anchors { top: parent.top; right: parent.right }
        width: 300
        height: instructions.height + 20
        color: theme.background3
        radius: theme.radius

        Column {
            id: instructions
            spacing: 5
            padding: 10
            width: parent.width

            Label {
                font { pixelSize: 16; family: theme.primaryfont; weight: Font.Bold }
                color: theme.primarytextcolor
                text: "Setup Requirements"
            }

            Label {
                font { pixelSize: 14; family: theme.primaryfont }
                width: parent.width - 20
                color: theme.secondarytextcolor
                textFormat: Text.MarkdownText
                wrapMode: Text.WrapAtWordBoundaryOrAnywhere
                text: "- Device must be on 2.4GHz WiFi\n- Local UDP communication must be enabled"
            }
        }
    }

    // Main Content
    Column {
        width: parent.width
        height: parent.height
        spacing: 10

        // Scanning Indicator
        Rectangle {
            id: scanningItem
            height: 50
            width: childrenRect.width + 15
            visible: service.controllers.length === 0
            color: theme.background3
            radius: theme.radius

            BusyIndicator {
                id: scanningIndicator
                height: 30
                width: parent.height
                anchors.verticalCenter: parent.verticalCenter
                Material.accent: "#88FFFFFF"
                running: scanningItem.visible
            }

            Column {
                anchors { left: scanningIndicator.right; verticalCenter: parent.verticalCenter }
                Text {
                    color: theme.secondarytextcolor
                    text: "Searching for WIZ devices..."
                    font { pixelSize: 14; family: "Montserrat" }
                }
                Text {
                    color: theme.secondarytextcolor
                    text: "This may take a moment..."
                    font { pixelSize: 14; family: "Montserrat" }
                }
            }
        }

        // Device Count
        Text {
            visible: service.controllers.length > 0
            color: theme.primarytextcolor
            text: "Found " + service.controllers.length + " device(s)"
            font { pixelSize: 14; family: "Poppins"; weight: Font.Bold }
        }

        // Device List
        Repeater {
            model: service.controllers

            delegate: Item {
                id: delegateRoot
                width: 350
                height: content.height
                property var device: model.modelData.obj

                // Friendly name falls back to the raw module code when no
                // library entry exists. The capability string mirrors the
                // RGB/TW/white-channel detection in WIZ.js.
                property string friendlyName: (device.wiztype && device.wiztype.productName)
                    ? device.wiztype.productName
                    : device.modelName
                property string capability: device.isRGB
                    ? (device.hasWhite ? "RGBW" : "RGB")
                    : device.isTW ? "TW" : "DIMMING"
                property color capabilityColor: {
                    if (delegateRoot.capability === "RGBW") return "#2196F3";
                    if (delegateRoot.capability === "RGB") return "#4CAF50";
                    if (delegateRoot.capability === "TW") return "#FFC107";
                    return theme.warn;
                }

                Rectangle {
                    anchors.fill: parent
                    color: Qt.lighter(theme.background2, 1.3)
                    radius: 5
                    opacity: device.isOnline ? 1.0 : 0.55
                }

                Column {
                    id: content
                    width: parent.width
                    padding: 15
                    spacing: 5

                    // Header: name + status dot + capability chip
                    Row {
                        spacing: 8
                        Rectangle {
                            width: 10; height: 10; radius: 5
                            anchors.verticalCenter: parent.verticalCenter
                            color: device.isOnline ? "#4CAF50" : theme.warn
                        }
                        Text {
                            color: theme.primarytextcolor
                            text: delegateRoot.friendlyName
                            font { pixelSize: 16; family: "Poppins"; weight: Font.Bold }
                        }
                        Rectangle {
                            width: chipText.width + 12
                            height: chipText.height + 4
                            radius: 3
                            anchors.verticalCenter: parent.verticalCenter
                            color: delegateRoot.capabilityColor
                            Text {
                                id: chipText
                                anchors.centerIn: parent
                                text: delegateRoot.capability
                                color: "white"
                                font { pixelSize: 10; family: "Poppins"; weight: Font.Bold }
                            }
                        }
                        Text {
                            visible: !device.isOnline
                            color: theme.warn
                            text: "(offline)"
                            anchors.verticalCenter: parent.verticalCenter
                            font { pixelSize: 12; family: "Poppins"; italic: true }
                        }
                    }

                    // Module code (if different from friendly name)
                    Text {
                        visible: device.wiztype && device.wiztype.productName
                        color: theme.secondarytextcolor
                        text: device.modelName
                        font { pixelSize: 11; family: "Poppins"; italic: true }
                    }

                    // ID and Room
                    Row {
                        spacing: 5
                        Text { color: theme.secondarytextcolor; text: "ID: " + device.id }
                        Text { color: theme.secondarytextcolor; text: "|" }
                        Text { color: theme.secondarytextcolor; text: "Room: " + (device.roomId || "N/A") }
                    }

                    // IP and Firmware
                    Row {
                        spacing: 5
                        Text { color: theme.secondarytextcolor; text: "IP: " + (device.ip || "Unknown") }
                        Text { color: theme.secondarytextcolor; text: "|" }
                        Text { color: theme.secondarytextcolor; text: "FW: " + device.fwVersion }
                    }

                    // Color Support
                    Text {
                        color: device.isRGB ? theme.secondarytextcolor : theme.warn
                        text: device.isRGB
                            ? (device.hasWhite ? "Full RGB + Dedicated White LED" : "Full RGB Color")
                            : device.isTW
                                ? "Color Temperature (2200K-6500K)"
                                : "Basic Dimming"
                    }
                }
            }
        }
    }
}
