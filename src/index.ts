import dlv from "dlv";

export interface Themed<T> {
  theme?: T;
}
export type Themeable<K extends string, V> = { [p in K]?: ResponsiveValue<V> };

export type Props<T, K extends string, V> = Themed<T> & Themeable<K, V>;

/**
 * This is the type of a prop that can be responsive. The prop can be given a
 * single value or an array of values to corresponding with breakpoints from the
 * theme. In the latter case, any slots in the array that are null are ignored
 */
export type ResponsiveValue<V> = V | Array<V | null>;

export type Interpolator = (value: any) => string;

// Type refining functions
const asThemed = <T, K extends string, V>(p: Props<T, K, V>): Themed<T> => p;
const asThemeable = <T, K extends string, V>(
  p: Props<T, K, V>
): Themeable<K, V> => p;

type ThemeGetter<Theme, V> = (theme: Theme, propValue: V) => any;

const defaultGetFromTheme = <Theme, V>(theme: Theme, propValue: V) =>
  dlv(theme, propValue);

/**
 * Create a looky resolver
 *
 * @param {Function} getMedia function that returns the breakpoints from theme
 *
 * @returns {Function} a factory function to create mixins
 */
const Looky = <Theme>(getMedia: (theme: Theme) => string[]) => {
  /**
   * Creates a mixin that can get a prop's values (identified by it's name)
   * from props and generate some CSS string using the interpolate function
   *
   * @param {string} prop The name of the prop which holds theme attributes
   * @param {Function} interpolate function that is called with values from theme and returns a CSS string
   * @param {Function} getValueFromTheme function that can be used to locate a theme value given a theme and theme attribute
   *
   * @returns {Function} a mixin function that accepts props and returns css strings
   */
  const resolve = <K extends string, V>(
    prop: K,
    interpolate: Interpolator,
    getValueFromTheme: ThemeGetter<Theme, V> = defaultGetFromTheme
  ) => {
    /**
     * A function that inspects a component's for a given prop and generates CSS
     * based on its value or values
     *
     * @param props a components props
     *
     * @returns {string} a css string
     */
    const mixin = (props: Props<Theme, K, V>): string => {
      const value = asThemeable(props)[prop];
      const { theme } = asThemed(props);
      if (!theme || value == null) {
        return "";
      }
      const media = getMedia(theme);
      const keys = Array.isArray(value) ? value : [value];
      return keys
        .map((k, i) => {
          if (k == null) {
            return "";
          }
          const themeValue = getValueFromTheme(theme, k);
          if (themeValue == null) {
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
