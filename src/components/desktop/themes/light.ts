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
        thumbColor: "rgba(0, 0, 0, 0.2)",
        thumbHoverColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: "2px",
      },
    },
  },
};
