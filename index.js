/**
 * Popup Blocker Plugin
 * Blocks daily gift, diamond spin, and news popups on login.
 */

class PopupBlocker {
  constructor() {
    this.enabled = false;
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;

    // Toggle checkbox
    this.toggleEl = document.getElementById("popupBlockerToggle");
    if (this.toggleEl) {
      this.toggleEl.addEventListener("change", (e) => {
        this.enabled = e.target.checked;
        const state = this.enabled ? "enabled" : "disabled";
        jam.showToast(`Popup Blocker ${state}`, this.enabled ? "success" : "info");
        console.log(`[popup-blocker] ${state}`);
      });
    }

    // Hook packet stream
    jam.on("packet", (packet, direction, next) => {
      if (!this.enabled) return next(packet);
      if (direction !== "in") return next(packet);

      if (packet.t === "xt") {
        const cmd = packet.b?.cmd;

        if (["dl", "al", "bl"].includes(cmd)) {
          console.log(`[popup-blocker] blocked popup: ${cmd}`);
          return; // drop packet
        }

        if (cmd === "gl") {
          const id = packet.b?.o?.params?.id;
          const blockedIDs = [
            44, 54, 741, 742, 743, 744, 745, 746, 747, 748, 749, 756, 761, 770
          ];
          if (blockedIDs.includes(Number(id))) {
            console.log(`[popup-blocker] blocked gl popup id: ${id}`);
            return; // drop packet
          }
        }
      }

      return next(packet);
    });

    console.log("[popup-blocker] Initialized");
    this.initialized = true;
  }
}

// Attach to window so SJ can find it
document.addEventListener("DOMContentLoaded", () => {
  window.popupBlocker = new PopupBlocker();
});
