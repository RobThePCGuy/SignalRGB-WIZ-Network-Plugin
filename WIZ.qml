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
                width: 350
                height: content.height
                property var device: model.modelData.obj

                Rectangle {
                    anchors.fill: parent
                    color: Qt.lighter(theme.background2, 1.3)
                    radius: 5
                }

                Column {
                    id: content
                    width: parent.width
                    padding: 15
                    spacing: 5

                    // Device Name
                    Text {
                        color: theme.primarytextcolor
                        text: device.modelName
                        font { pixelSize: 16; family: "Poppins"; weight: Font.Bold }
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
                            ? "Full RGB Color"
                            : device.isTW
                                ? "Color Temperature (2200K-6500K)"
                                : "Basic Dimming"
                    }
                }
            }
        }
    }
}
