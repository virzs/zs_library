import { Theme, themeDark, themeLight } from './theme';
import { SortItem } from './types';

class SortableUtils {
  /** 清理重复id */
  public static uniqueArray = (array: SortItem[]) =>
    array.reduce((acc: SortItem[], current) => {
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
