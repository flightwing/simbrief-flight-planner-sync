<p align="center">
  <img src="src/icon.png" alt="SimBrief Flight Planner Sync Logo" width="128">
</p>

# ✈️ SimBrief Flight Planner Sync

> **A lightweight browser extension that imports your latest [SimBrief](https://www.simbrief.com/) flight plan into the [Microsoft Flight Simulator Flight Planner](https://planner.flightsimulator.com/) with a single click.**

![Version](https://img.shields.io/github/v/release/flightwing/simbrief-flight-planner-sync?style=for-the-badge&color=blue)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Chromium-lightgrey?style=for-the-badge)
![License](https://img.shields.io/github/license/flightwing/simbrief-flight-planner-sync?style=for-the-badge)

---

## 📖 About This Project

**SimBrief Flight Planner Sync** connects two tools that flight simmers use every day. You plan your flight in SimBrief, and the extension takes care of moving the route into the web-based Flight Planner for Microsoft Flight Simulator. No more copying route strings between browser tabs.

The extension fetches your latest briefing from the public SimBrief API, shows a short preview so you can check it, and then fills in the route in the Flight Planner for you.

### ✨ Key Features

*   **🚀 One-click import:** Load your latest SimBrief briefing and send the route to the Flight Planner in seconds.
*   **👀 Preview before import:** Check departure, arrival, callsign, cruise altitude and route before anything is changed.
*   **⚠️ Clear feedback:** If the Flight Planner cannot resolve part of the route, you see its warning straight in the extension.
*   **💾 Remembers you:** Your SimBrief username or Pilot ID is saved once and synced across your browsers.
*   **🔒 Privacy friendly:** No backend, no tracking. Your flight plans never leave your browser except for the request to SimBrief.

## 📥 Installation

You can download the latest version from the Releases page:

[**👉 Download Latest Release**](https://github.com/flightwing/simbrief-flight-planner-sync/releases/latest)

Then install it as an unpacked extension:

1. Unzip the downloaded archive.
2. Open `chrome://extensions` (or `edge://extensions` in Microsoft Edge).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder (the one containing `manifest.json`).

## 🛫 Usage

1. Open the [Flight Planner](https://planner.flightsimulator.com/) in your browser.
2. Click the extension icon and enter your SimBrief **Username** or **Pilot ID** — the extension recognizes which one it is.
3. Click **Load from SimBrief** and review the briefing preview.
4. Click **Import into Flight Planner**.
5. Check the route in the Flight Planner and save your changes there.

> *Tip:* Your Pilot ID can be found in your SimBrief account settings.

## 📖 The Story

When preparing a flight, I always planned it in SimBrief first and then had to retype or copy-paste the route into the MSFS Flight Planner. It is a small step, but it repeats before every single flight and it is easy to make a mistake. I wanted a quick way to move the plan from one service to the other, so I created this extension for myself and the community.

## ℹ️ What is SimBrief?

> *Note: The description below refers to the SimBrief service itself, not this extension.*

[SimBrief](https://www.simbrief.com/) is a free, widely used online flight planning tool for flight simulation, now part of [Navigraph](https://navigraph.com/).

*   **📋 Realistic briefings:** Generates airline-style operational flight plans (OFPs) with routes, fuel planning, weights and weather.
*   **✈️ Simulator integration:** Its flight plans can be used by many add-on aircraft, EFBs and tools across simulators.
*   **🌍 Free to use:** Available to everyone with a free account.

---

## ⚠️ Disclaimer & Attribution

### 🛑 For Flight Simulation Use Only
**Do not use this extension, SimBrief, or the Flight Planner for real-world navigation.** The data provided may be outdated, incomplete, or inaccurate.

### ⚖️ This Project
This extension is an open-source project developed by the community. **It is NOT associated with, endorsed by, or affiliated with SimBrief, Navigraph, Microsoft, or Asobo Studio.**

All rights to the SimBrief and Microsoft Flight Simulator names, logos, and underlying services belong to their respective owners. This extension simply transfers data you already have access to from one service to the other.

## 🐛 Report a Bug

If you encounter any issues **specific to this extension** (e.g., the route is not imported, the extension cannot find the Route panel, unexpected errors), please report them on our [GitHub Issues page](https://github.com/flightwing/simbrief-flight-planner-sync/issues).

The Flight Planner has no public import interface, so the extension works with its user interface directly. When Microsoft updates the Flight Planner, the import may stop working until the extension is updated. Please include the error message from the extension in your report.

**Please note:** If your briefing contains wrong data, or the Flight Planner itself misbehaves, these are likely issues with [SimBrief](https://www.simbrief.com/) or the [Flight Planner](https://planner.flightsimulator.com/) and should be reported to their teams directly, not here.

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open a pull request or start a discussion.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧑‍💻 Development

The extension is written in plain JavaScript (Manifest V3) and needs no build step:

```bash
# Clone the repository
git clone https://github.com/flightwing/simbrief-flight-planner-sync.git
```

Then load the cloned folder in `chrome://extensions` via **Load unpacked** (with **Developer mode** turned on). After changing the code, click the reload icon on the extension card and refresh the Flight Planner tab.

Project structure:

| Path | Purpose |
| --- | --- |
| `manifest.json` | Extension manifest, permissions and content script targets. |
| `src/popup/` | Popup UI: SimBrief identity, briefing preview and import button. |
| `src/background/` | Service worker that fetches the briefing from the SimBrief API. |
| `src/adapters/simbrief.js` | SimBrief API client. |
| `src/adapters/msfs-flight-planner.js` | Fills the route in the Flight Planner. All UI selectors live here. |
| `src/content/flight-planner.js` | Content script that receives the import request on the Flight Planner page. |
| `src/shared/flight-plan.js` | Internal flight plan model and normalization. |
