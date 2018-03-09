import Looky from ".";

const interpolate = (v: any) => `margin-bottom: ${v};`;

enum Spacing {
  Unknown = "unknown",
  Small = "small",
  Default = "default",
  Large = "large"
}

interface Theme {
  media: string[];
  spacings: { [k in Spacing]?: string };
}

interface TestCase {
  title: string;
  expected: string;
  interpolate: (v: any) => string;
  props: {
    spacing?: Spacing | Array<Spacing | null>;
    theme: Theme;
  };
}

const testCases: TestCase[] = [
  {
    title: "resolves single value",
    expected: "margin-bottom: 32px;",
    interpolate,
    props: {
      spacing: Spacing.Large,
      theme: {
        media: ["576px", "768px", "992px", "1200px"],
        spacings: { small: "8px", default: "16px", large: "32px" }
      }
    }
  },
  {
    title: "resolves responsive value",
    expected: [
      "margin-bottom: 8px;",
      "@media (min-width: 576px) { margin-bottom: 16px; }",
      "",
      "@media (min-width: 992px) { margin-bottom: 32px; }"
    ].join("\n"),
    interpolate,
    props: {
      spacing: [Spacing.Small, Spacing.Default, null, Spacing.Large],
      theme: {
        media: ["576px", "768px", "992px", "1200px"],
        spacings: { small: "8px", default: "16px", large: "32px" }
      }
    }
  },
  {
    title: "resolves missing value",
    expected: "",
    interpolate,
    props: {
      spacing: Spacing.Unknown,
      theme: {
        media: ["576px", "768px", "992px", "1200px"],
        spacings: { small: "8px", default: "16px", large: "32px" }
      }
    }
  },
  {
    title: "resolves missing responsive values",
    expected: [
      "margin-bottom: 8px;",
      "",
      "",
      "@media (min-width: 992px) { margin-bottom: 32px; }"
    ].join("\n"),
    interpolate,
    props: {
      spacing: [Spacing.Small, Spacing.Unknown, null, Spacing.Large],
      theme: {
        media: ["576px", "768px", "992px", "1200px"],
        spacings: { small: "8px", default: "16px", large: "32px" }
      }
    }
  },
  {
    title: "ignores excess values",
    expected: [
      "margin-bottom: 8px;",
      "@media (min-width: 576px) { margin-bottom: 8px; }",
      "@media (min-width: 768px) { margin-bottom: 16px; }",
      "",
      ""
    ].join("\n"),
    interpolate,
    props: {
      spacing: [
        Spacing.Small,
        Spacing.Small,
        Spacing.Default,
        Spacing.Large,
        Spacing.Large
      ],
      theme: {
        media: ["576px", "768px"],
        spacings: { small: "8px", default: "16px", large: "32px" }
      }
    }
  }
];

testCases.forEach(({ title, expected, interpolate: i, props: p }) => {
  test(title, () => {
    const resolver = Looky<Theme>(theme => theme.media);
    const mixin = resolver<"spacing", Spacing>("spacing", i, (th, v) => {
      return th.spacings[v];
    });
    const out = mixin(p);
    expect(out).toBe(expected);
  });
});
