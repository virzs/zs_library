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
