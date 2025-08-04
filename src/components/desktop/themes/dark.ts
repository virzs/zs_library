import { Theme } from ".";

export const themeDark: Theme = {
  token: {
    items: {
      textColor: "white",
      iconBackgroundColor: "#1f2937",
      iconShadowColor: "rgba(0, 0, 0, 0.1)",
      groupIconBackgroundColor: "rgba(0, 0, 0, 0.1)",
      groupIconShadowColor: "rgba(0, 0, 0, 0.1)",
      groupModalBackgroundColor: "rgba(0, 0, 0, 0.1)",
      infoModalBackgroundColor: "#1a1a1a",
    },
    contextMenu: {
      textColor: "white",
      activeColor: "#1a1a1a",
      dangerColor: "#ff453a",
      backgroundColor: "rgba(26, 26, 26, 0.75)",
      shadowColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    dock: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadowColor: "rgba(0, 0, 0, 0.3)",
      divider: {
        color: "rgba(255, 255, 255, 0.2)",
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(20px)",
      },
      content: {
        backgroundColor: "rgba(31, 41, 55, 0.85)",
        backdropFilter: "blur(20px)",
        boxShadowColor: "rgba(0, 0, 0, 0.3)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: "16px",
      },
      header: {
        backgroundColor: "transparent",
        textColor: "white",
      },
      body: {
        backgroundColor: "transparent",
      },
      scrollbar: {
        width: "4px",
        trackColor: "transparent",
        thumbColor: "rgba(255, 255, 255, 0.3)",
        thumbHoverColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: "2px",
      },
    },
  },
};
