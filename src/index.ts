import dlv from "dlv";

export interface Themed<T> {
  theme?: T;
}
export type Themeable<K extends string, V> = { [p in K]?: ResponsiveValue<V> };

export type Props<T, K extends string, V> = Themed<T> & Themeable<K, V>;

export type ResponsiveValue<V> = V | Array<V | null>;

export type Interpolator = (value: any) => string;

const asThemed = <T, K extends string, V>(p: Props<T, K, V>): Themed<T> => p;
const asThemeable = <T, K extends string, V>(
  p: Props<T, K, V>
): Themeable<K, V> => p;

type ThemeGetter<Theme, V> = (theme: Theme, propValue: V) => any;

const defaultGetFromTheme = <Theme, V>(theme: Theme, propValue: V) =>
  dlv(theme, propValue);

const Looky = <Theme>(getMedia: (theme: Theme) => string[]) => {
  const resolve = <K extends string, V>(
    prop: K,
    interpolate: Interpolator,
    getValueFromTheme: ThemeGetter<Theme, V> = defaultGetFromTheme
  ) => {
    const mixin = (props: Props<Theme, K, V>): string => {
      const value = asThemeable(props)[prop];
      const { theme } = asThemed(props);
      if (!theme || !value) {
        return "";
      }
      const media = getMedia(theme);
      const keys = Array.isArray(value) ? value : [value];
      return keys
        .map((k, i) => {
          if (!k) {
            return "";
          }
          const themeValue = getValueFromTheme(theme, k);
          if (!themeValue) {
            return "";
          }
          const rules = interpolate(themeValue);
          if (i === 0) {
            return rules;
          }
          const breakpoint = media[i - 1];
          if (!breakpoint) {
            return "";
          }
          return `@media (min-width: ${breakpoint}) { ${rules} }`;
        })
        .join("\n");
    };

    return mixin;
  };

  return resolve;
};

export default Looky;
