import { Theme } from ".";

export const themeLight: Theme = {
  token: {
    base: {
      hoverColor: "rgba(255, 255, 255, 0.1)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      textColor: "rgba(28, 28, 30, 0.88)",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(40px)",
    },
    items: {
      textColor: "rgba(28, 28, 30, 0.88)",
      textShadowColor: "rgba(255, 255, 255, 0.68)",
      iconBackgroundColor: "rgba(255, 255, 255, 0.15)",
      iconShadowColor: "rgba(0, 0, 0, 0.2)",
      groupIconBackgroundColor: "rgba(255, 255, 255, 0.15)",
      groupIconShadowColor: "rgba(0, 0, 0, 0.2)",
      infoModalBackgroundColor: "rgba(255, 255, 255, 0.15)",
      groupModal: {
        backgroundColor: "rgba(255, 255, 255, 0.12)",
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
      activeColor: "rgba(0, 0, 0, 0.06)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(40px)",
    },
    desktop: {
      pageSwitchEdge: {
        leftGradient: "linear-gradient(90deg, rgba(0, 122, 255, 0.34) 0%, rgba(0, 122, 255, 0.14) 42%, rgba(0, 122, 255, 0) 100%)",
        rightGradient: "linear-gradient(270deg, rgba(0, 122, 255, 0.34) 0%, rgba(0, 122, 255, 0.14) 42%, rgba(0, 122, 255, 0) 100%)",
        glowColor: "rgba(0, 122, 255, 0.38)",
      },
    },
    dock: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadowColor: "rgba(0, 0, 0, 0.2)",
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
          textColor: "rgba(255, 255, 255, 0.85)",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          shadowColor: "rgba(0, 0, 0, 0.2)",
          hoverGlowColor: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
      },
      content: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(40px)",
        boxShadowColor: "rgba(0, 0, 0, 0.2)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.3)",
        borderColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: "20px",
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
        thumbColor: "rgba(255, 255, 255, 0.2)",
        thumbHoverColor: "rgba(255, 255, 255, 0.35)",
        borderRadius: "2px",
      },
    },
  },
};
