import { Theme } from ".";

export const themeDark: Theme = {
  token: {
    itemNameColor: "white",
    itemIconBackgroundColor: "#1f2937",
    itemIconShadowColor: "rgba(0, 0, 0, 0.1)",
    groupItemIconBackgroundColor: "rgba(0, 0, 0, 0.1)",
    groupItemIconShadowColor: "rgba(0, 0, 0, 0.1)",
    groupItemModalBackgroundColor: "rgba(0, 0, 0, 0.1)",
    contextMenuTextColor: "white",
    contextMenuActiveColor: "#1a1a1a",
    contextMenuBackgroundColor: "#1a1a1a",
    contextMenuShadowColor: "rgba(255, 255, 255, 0.1)",
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
