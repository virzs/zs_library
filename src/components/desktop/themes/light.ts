import { Theme } from ".";

export const themeLight: Theme = {
  token: {
    itemNameColor: "#1a1a1a",
    itemIconBackgroundColor: "white",
    itemIconShadowColor: "rgba(0, 0, 0, 0.1)",
    groupItemIconBackgroundColor: "rgba(255, 255, 255, 0.1)",
    groupItemIconShadowColor: "rgba(0, 0, 0, 0.1)",
    groupItemModalBackgroundColor: "rgba(255, 255, 255, 0.8)",
    contextMenu: {
      textColor: "black",
      activeColor: "#f3f4f6",
      dangerColor: "#ff3b30",
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    dock: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadowColor: "rgba(0, 0, 0, 0.1)",
      divider: {
        color: "rgba(255, 255, 255, 0.3)",
      },
    },
    modal: {
      mask: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(20px)",
      },
      content: {
        backgroundColor: "rgba(255, 255, 255, 0.77)",
        backdropFilter: "blur(20px)",
        boxShadowColor: "rgba(0, 0, 0, 0.15)",
        boxShadowBorderColor: "rgba(255, 255, 255, 0.25)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "16px",
      },
      header: {
        backgroundColor: "transparent",
        textColor: "#1a1a1a",
      },
      body: {
        backgroundColor: "transparent",
      },
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
