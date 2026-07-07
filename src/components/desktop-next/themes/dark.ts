import { Theme } from ".";

export const themeDark: Theme = {
  token: {
    base: {
      hoverColor: "rgba(255, 255, 255, 0.08)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(30, 30, 30, 0.85)",
      textColor: "rgba(255, 255, 255, 0.9)",
      shadowColor: "rgba(0, 0, 0, 0.4)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(40px)",
    },
    items: {
      textColor: "rgba(255, 255, 255, 0.9)",
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      iconBackgroundColor: "rgba(40, 40, 40, 0.9)",
      iconShadowColor: "rgba(0, 0, 0, 0.4)",
      groupIconBackgroundColor: "rgba(40, 40, 40, 0.5)",
      groupIconShadowColor: "rgba(0, 0, 0, 0.4)",
      infoModalBackgroundColor: "rgba(30, 30, 30, 0.85)",
      groupModal: {
        backgroundColor: "rgba(30, 30, 30, 0.85)",
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
      activeColor: "rgba(255, 255, 255, 0.08)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(30, 30, 30, 0.85)",
      shadowColor: "rgba(0, 0, 0, 0.4)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(40px)",
    },
    desktop: {
      pageSwitchEdge: {
        leftGradient: "linear-gradient(90deg, rgba(10, 132, 255, 0.42) 0%, rgba(10, 132, 255, 0.18) 42%, rgba(10, 132, 255, 0) 100%)",
        rightGradient: "linear-gradient(270deg, rgba(10, 132, 255, 0.42) 0%, rgba(10, 132, 255, 0.18) 42%, rgba(10, 132, 255, 0) 100%)",
        glowColor: "rgba(10, 132, 255, 0.42)",
      },
    },
    dock: {
      backgroundColor: "rgba(30, 30, 30, 0.7)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadowColor: "rgba(0, 0, 0, 0.4)",
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
          backgroundColor: "rgba(40, 40, 40, 0.9)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          shadowColor: "rgba(0, 0, 0, 0.4)",
          hoverGlowColor: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
      },
      content: {
        backgroundColor: "rgba(30, 30, 30, 0.85)",
        backdropFilter: "blur(40px)",
        boxShadowColor: "rgba(0, 0, 0, 0.5)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
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
