import { Theme, themeDark, themeLight } from './theme';

class SortableUtils {
  public static uniqueArray = (array: any[]) =>
    array.reduce((acc, current) => {
      const x = acc.find((item: any) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

  public static getTheme = (theme?: Theme) => {
    const tlt = themeLight.token;
    const tdt = themeDark.token;

    const tl = { ...tlt, ...theme?.token };
    const dl = { ...tdt, ...theme?.token };

    return { light: tl, dark: dl };
  };
}

export default SortableUtils;
