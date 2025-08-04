import { Theme } from ".";

export const themeLight: Theme = {
  token: {
    base: {
      primaryColor: "#f3f4f6",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      textColor: "#333333",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    items: {},
    contextMenu: {},
    dock: {},
    modal: {
      mask: {
        backdropFilter: "blur(20px)",
      },
      content: {
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
      },
      header: {
        backgroundColor: "transparent",
      },
      body: {
        backgroundColor: "transparent",
      },
      scrollbar: {
        width: "4px",
        trackColor: "transparent",
        borderRadius: "2px",
      },
    },
  },
};
