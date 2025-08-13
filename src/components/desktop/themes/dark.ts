import { Theme } from ".";

export const themeDark: Theme = {
  token: {
    base: {
      hoverColor: "rgba(255, 255, 255, 0.05)",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(26, 26, 26, 0.75)",
      textColor: "white",
      shadowColor: "rgba(255, 255, 255, 0.1)",
      boxShadowBorderColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(20px)",
    },
    items: {
      groupModal: {
        backgroundColor: "rgba(26, 26, 26, 0.95)",
        title: {
          textColor: "white",
          backgroundColor: "transparent",
          hoverBackgroundColor: "rgba(255, 255, 255, 0.03)",
          focusBackgroundColor: "rgba(255, 255, 255, 0.06)",
          shadowColor: "rgba(0, 122, 255, 0.3)",
          placeholderColor: "rgba(255, 255, 255, 0.6)",
          selectionBackgroundColor: "rgba(0, 122, 255, 0.3)",
        },
      },
    },
    contextMenu: {},
    dock: {
      launchpad: {
        modal: {
          searchBox: {
          iconColor: "rgba(255, 255, 255, 0.8)",
          iconFocusColor: "#007aff",
          backgroundColor: "rgba(118, 118, 128, 0.24)",
          focusBackgroundColor: "rgba(118, 118, 128, 0.36)",
          textColor: "white",
          placeholderColor: "rgba(255, 255, 255, 0.7)",
          shadowColor: "rgba(0, 0, 0, 0.3)",
          clearButton: {
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            hoverBackgroundColor: "rgba(255, 255, 255, 0.5)",
            textColor: "rgba(0, 0, 0, 0.8)",
          },
        },
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
        thumbColor: "rgba(255, 255, 255, 0.1)",
        thumbHoverColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "2px",
      },
    },
  },
};
