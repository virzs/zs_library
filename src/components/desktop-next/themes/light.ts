import { Theme } from ".";

export const themeLight: Theme = {
  token: {
    base: {
      hoverColor: "rgba(255, 255, 255, 0.1)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      textColor: "rgba(255, 255, 255, 0.9)",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(40px)",
    },
    items: {
      textColor: "rgba(255, 255, 255, 0.9)",
      iconBackgroundColor: "rgba(255, 255, 255, 0.15)",
      iconShadowColor: "rgba(0, 0, 0, 0.2)",
      groupIconBackgroundColor: "rgba(255, 255, 255, 0.15)",
      groupIconShadowColor: "rgba(0, 0, 0, 0.2)",
      infoModalBackgroundColor: "rgba(255, 255, 255, 0.15)",
      groupModal: {
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        title: {
          textColor: "rgba(255, 255, 255, 0.9)",
          backgroundColor: "transparent",
          hoverBackgroundColor: "rgba(255, 255, 255, 0.08)",
          focusBackgroundColor: "rgba(255, 255, 255, 0.12)",
          shadowColor: "rgba(0, 122, 255, 0.3)",
          placeholderColor: "rgba(255, 255, 255, 0.5)",
          selectionBackgroundColor: "rgba(0, 122, 255, 0.3)",
        },
      },
    },
    contextMenu: {
      textColor: "rgba(255, 255, 255, 0.9)",
      activeColor: "rgba(255, 255, 255, 0.1)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(40px)",
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
          searchBox: {
            iconColor: "rgba(255, 255, 255, 0.7)",
            iconFocusColor: "#007aff",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            focusBackgroundColor: "rgba(255, 255, 255, 0.22)",
            textColor: "rgba(255, 255, 255, 0.9)",
            placeholderColor: "rgba(255, 255, 255, 0.5)",
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
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
      },
      content: {
        backgroundColor: "rgba(30, 30, 30, 0.85)",
        backdropFilter: "blur(40px)",
        boxShadowColor: "rgba(0, 0, 0, 0.4)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
      },
      header: {
        textColor: "rgba(255, 255, 255, 0.9)",
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
