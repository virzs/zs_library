export const isDarkScheme = (theme: string) => {
  if (theme === "dark") {
    return true;
  }
  if (theme === "light") {
    return false;
  }
  if (
    document.documentElement
      .getAttribute("style")
      ?.includes("color-scheme: dark;")
  ) {
    return true;
  }
  if (
    document.documentElement
      .getAttribute("style")
      ?.includes("color-scheme: light;")
  ) {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
