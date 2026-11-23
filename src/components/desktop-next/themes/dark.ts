import type { Theme } from ".";
import { darkBase } from "./base";

const desktopGlass = {
  backgroundColor: "rgba(30, 35, 48, 0.84)",
  borderColor: "rgba(228, 237, 255, 0.16)",
  shadowColor: "rgba(7, 12, 24, 0.32)",
};

export const themeDark: Theme = {
  token: {
    base: darkBase,
    items: {
      textColor: "#f8f9ff",
      textShadowColor: "rgba(8,14,38,.65)",
      iconBackgroundColor: "rgba(40, 40, 40, 0.9)",
      iconShadowColor: "rgba(5,10,29,.30)",
      groupIconBackgroundColor: desktopGlass.backgroundColor,
      groupIconBorderColor: desktopGlass.borderColor,
      groupIconShadowColor: desktopGlass.shadowColor,
      infoModalBackgroundColor: "rgba(30, 30, 30, 0.85)",
      groupModal: {
        title: {
          textColor: "rgba(255, 255, 255, 0.9)",
          backgroundColor: "transparent",
          hoverBackgroundColor: "rgba(255, 255, 255, 0.05)",
          focusBackgroundColor: "rgba(255, 255, 255, 0.08)",
          shadowColor: "rgba(0, 122, 255, 0.3)",
          placeholderColor: "rgba(255, 255, 255, 0.5)",
          selectionBackgroundColor: "rgba(0, 122, 255, 0.3)",
        },
      },
    },
    contextMenu: {
      textColor: "rgba(255, 255, 255, 0.9)",
      activeColor: "rgba(255,255,255,.13)",
      dangerColor: darkBase.dangerColor,
      backgroundColor: "rgba(33,36,45,.86)",
      shadowColor: "rgba(5,9,23,.3)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(235,243,255,.22)",
      backdropFilter: "saturate(145%) blur(24px)",
    },
    desktop: {
      pagination: { activeColor: "#f8f9ff", inactiveColor: "rgba(229,236,251,.44)", edgeColor: "rgba(6,14,32,.35)" },
      pageSwitchEdge: {
        leftGradient: "linear-gradient(90deg, rgba(10, 132, 255, 0.42) 0%, rgba(10, 132, 255, 0.18) 42%, rgba(10, 132, 255, 0) 100%)",
        rightGradient: "linear-gradient(270deg, rgba(10, 132, 255, 0.42) 0%, rgba(10, 132, 255, 0.18) 42%, rgba(10, 132, 255, 0) 100%)",
        glowColor: "rgba(10, 132, 255, 0.42)",
      },
    },
    dock: {
      backgroundColor: desktopGlass.backgroundColor,
      borderColor: desktopGlass.borderColor,
      boxShadowColor: desktopGlass.shadowColor,
      divider: {
        color: "rgba(255, 255, 255, 0.12)",
      },
      launchpad: {
        modal: {
          searchBox: {
            iconColor: "rgba(255, 255, 255, 0.7)",
            iconFocusColor: "#007aff",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            focusBackgroundColor: "rgba(255, 255, 255, 0.15)",
            textColor: "rgba(255, 255, 255, 0.9)",
            placeholderColor: "rgba(255, 255, 255, 0.5)",
            shadowColor: "rgba(0, 0, 0, 0.3)",
            clearButton: {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              hoverBackgroundColor: "rgba(255, 255, 255, 0.35)",
              textColor: "rgba(255, 255, 255, 0.9)",
            },
          },
        },
        icon: {
          textColor: "rgba(255, 255, 255, 0.85)",
          ...desktopGlass,
          hoverGlowColor: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(7,11,22,.38)",
        backdropFilter: "blur(8px)",
      },
      content: {
        backgroundColor: "rgba(39,43,55,.82)",
        backdropFilter: "saturate(145%) blur(28px)",
        boxShadowColor: "rgba(0, 0, 0, 0.5)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "28px",
      },
      header: {
        textColor: "rgba(255, 255, 255, 0.9)",
      },
      floatingControls: {
        inset: "16px",
        fullscreenInset: "12px",
        gap: "7px",
        padding: "7px 8px",
        backgroundColor: "rgba(20, 24, 31, 0.14)",
        borderColor: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(18px)",
        opacity: 1,
        inactiveOpacity: 0.42,
        inactiveScale: 0.82,
        buttonSize: "16px",
        inactiveButtonSize: "12px",
        closeButton: {
          backgroundColor: "rgba(255, 95, 86, 0.96)",
          textColor: "rgba(85, 20, 14, 0.85)",
          iconSize: 9,
        },
        fullscreenButton: {
          backgroundColor: "rgba(48, 209, 88, 0.96)",
          textColor: "rgba(4, 58, 26, 0.9)",
          iconSize: 9,
        },
      },
      scrollbar: {
        width: "4px",
        trackColor: "transparent",
        thumbColor: "rgba(255, 255, 255, 0.15)",
        thumbHoverColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: "2px",
      },
    },
  },
};
