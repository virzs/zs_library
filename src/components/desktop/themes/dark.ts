import { Theme } from ".";

export const themeDark: Theme = {
  token: {
    base: {
      primaryColor: "#1a1a1a",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(26, 26, 26, 0.75)",
      textColor: "white",
      shadowColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
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
      header: {},
      scrollbar: {
        width: "4px",
        trackColor: "transparent",
        borderRadius: "2px",
      },
    },
  },
};
