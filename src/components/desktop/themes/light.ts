import { Theme } from ".";

export const themeLight: Theme = {
  token: {
    base: {
      hoverColor: "rgba(0, 0, 0, 0.05)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      textColor: "#333333",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.25)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      backdropFilter: "blur(20px)",
    },
    items: {
      groupModal: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        title: {
          textColor: "#1d1d1f",
          backgroundColor: "transparent",
          hoverBackgroundColor: "rgba(0, 0, 0, 0.03)",
          focusBackgroundColor: "rgba(0, 0, 0, 0.06)",
          shadowColor: "rgba(0, 122, 255, 0.3)",
          placeholderColor: "rgba(29, 29, 31, 0.6)",
          selectionBackgroundColor: "rgba(0, 122, 255, 0.3)",
        },
      },
    },
    contextMenu: {},
    dock: {
      launchpad: {
        modal: {
          searchBox: {
            iconColor: "rgba(60, 60, 67, 0.6)",
            iconFocusColor: "#007aff",
            backgroundColor: "rgba(118, 118, 128, 0.12)",
            focusBackgroundColor: "rgba(118, 118, 128, 0.2)",
            textColor: "#1d1d1f",
            placeholderColor: "rgba(60, 60, 67, 0.6)",
            shadowColor: "rgba(0, 0, 0, 0.1)",
            clearButton: {
              backgroundColor: "rgba(60, 60, 67, 0.3)",
              hoverBackgroundColor: "rgba(60, 60, 67, 0.5)",
              textColor: "white",
            },
          },
        },
        icon: {
          textColor: "rgba(60, 60, 67, 0.8)",
          backgroundColor: "#ffffff",
          borderColor: "rgba(0, 0, 0, 0.1)",
          shadowColor: "rgba(0, 0, 0, 0.15)",
          hoverGlowColor: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    modal: {
      mask: {
        backdropFilter: "blur(20px)",
      },
      content: {
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
      },
      header: {},
      scrollbar: {
        width: "4px",
        trackColor: "transparent",
        thumbColor: "rgba(0, 0, 0, 0.2)",
        thumbHoverColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: "2px",
      },
    },
  },
};
