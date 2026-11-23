import type { Theme } from ".";
import { lightBase } from "./base";

const desktopGlass = {
  backgroundColor: "rgba(232,241,255,.65)",
  borderColor: "rgba(255,255,255,.76)",
  shadowColor: "rgba(43,65,102,.2)",
};

export const themeLight: Theme = {
  token: {
    base: lightBase,
    items: {
      textColor: "#152442",
      textShadowColor: "rgba(247,251,255,.9)",
      iconBackgroundColor: "rgba(255, 255, 255, 0.15)",
      iconShadowColor: "rgba(25,48,83,.18)",
      groupIconBackgroundColor: desktopGlass.backgroundColor,
      groupIconBorderColor: desktopGlass.borderColor,
      groupIconShadowColor: desktopGlass.shadowColor,
      infoModalBackgroundColor: "rgba(255, 255, 255, 0.15)",
      groupModal: {
        title: {
          textColor: "rgba(28, 28, 30, 0.88)",
          backgroundColor: "transparent",
          hoverBackgroundColor: "rgba(255, 255, 255, 0.08)",
          focusBackgroundColor: "rgba(255, 255, 255, 0.12)",
          shadowColor: "rgba(0, 122, 255, 0.3)",
          placeholderColor: "rgba(60, 60, 67, 0.45)",
          selectionBackgroundColor: "rgba(0, 122, 255, 0.3)",
        },
      },
    },
    contextMenu: {
      textColor: "rgba(28, 28, 30, 0.88)",
      activeColor: "rgba(31,49,77,.08)",
      dangerColor: lightBase.dangerColor,
      backgroundColor: "rgba(246,248,253,.91)",
      shadowColor: "rgba(30,50,77,.17)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255,255,255,.85)",
      backdropFilter: "saturate(145%) blur(24px)",
    },
    desktop: {
      pagination: { activeColor: "#ffffff", inactiveColor: "#acb9cf", edgeColor: "rgba(78,98,134,.53)" },
      pageSwitchEdge: {
        leftGradient: "linear-gradient(90deg, rgba(0, 122, 255, 0.34) 0%, rgba(0, 122, 255, 0.14) 42%, rgba(0, 122, 255, 0) 100%)",
        rightGradient: "linear-gradient(270deg, rgba(0, 122, 255, 0.34) 0%, rgba(0, 122, 255, 0.14) 42%, rgba(0, 122, 255, 0) 100%)",
        glowColor: "rgba(0, 122, 255, 0.38)",
      },
    },
    dock: {
      backgroundColor: desktopGlass.backgroundColor,
      borderColor: desktopGlass.borderColor,
      boxShadowColor: desktopGlass.shadowColor,
      divider: {
        color: "rgba(255, 255, 255, 0.2)",
      },
      launchpad: {
        modal: {
          letterIndexColor: "rgba(28, 28, 30, 0.42)",
          searchBox: {
            iconColor: "rgba(60, 60, 67, 0.45)",
            iconFocusColor: "#007aff",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            focusBackgroundColor: "rgba(255, 255, 255, 0.22)",
            textColor: "rgba(28, 28, 30, 0.88)",
            placeholderColor: "rgba(60, 60, 67, 0.45)",
            shadowColor: "rgba(0, 0, 0, 0.15)",
            clearButton: {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              hoverBackgroundColor: "rgba(255, 255, 255, 0.5)",
              textColor: "rgba(0, 0, 0, 0.8)",
            },
          },
        },
        icon: {
          textColor: lightBase.textColor,
          ...desktopGlass,
          hoverGlowColor: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(32,47,71,.20)",
        backdropFilter: "blur(8px)",
      },
      content: {
        backgroundColor: "rgba(240,245,253,.87)",
        backdropFilter: "saturate(145%) blur(28px)",
        boxShadowColor: "rgba(0, 0, 0, 0.2)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.3)",
        borderColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: "28px",
      },
      header: {
        textColor: "rgba(28, 28, 30, 0.88)",
      },
      floatingControls: {
        inset: "16px",
        fullscreenInset: "12px",
        gap: "7px",
        padding: "7px 8px",
        backgroundColor: "rgba(255, 255, 255, 0.16)",
        borderColor: "rgba(255, 255, 255, 0.28)",
        backdropFilter: "blur(18px)",
        opacity: 1,
        inactiveOpacity: 0.5,
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
        thumbColor: "rgba(44,60,89,.27)",
        thumbHoverColor: "rgba(44,60,89,.46)",
        borderRadius: "2px",
      },
    },
  },
};
