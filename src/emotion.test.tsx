import * as React from "react";
import * as renderer from "react-test-renderer";
import styled from "react-emotion";
import Looky from ".";

const theme = {
  media: ["576px", "768px", "992px", "1200px"],
  spacings: { small: "8px", default: "16px", large: "32px" }
};

const looky = Looky<typeof theme>(t => t.media);
const gutterX = looky(
  "gutterX",
  v => `
padding-left: ${v};
padding-right: ${v};
`
);
const Comp = styled<
  { theme: any; gutterX: string | Array<string | null> },
  "div"
>("div")`
  ${gutterX};
`;

test("works with emotion for single value", () => {
  expect(
    renderer
      .create(
        <Comp theme={theme} gutterX="spacings.small">
          Hello
        </Comp>
      )
      .toJSON()
  ).toMatchSnapshot();
});

test("works with emotion for responsive values", () => {
  expect(
    renderer
      .create(
        <Comp
          theme={theme}
          gutterX={[
            "spacings.small",
            null,
            "spacings.default",
            "spacings.large"
          ]}
        >
          Hello
        </Comp>
      )
      .toJSON()
  ).toMatchSnapshot();
});
