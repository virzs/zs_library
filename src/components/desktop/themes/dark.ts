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
        thumbColor: "rgba(255, 255, 255, 0.1)",
        thumbHoverColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "2px",
      },
    },
  },
};
