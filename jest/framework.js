const emotion = require("emotion");
const { createSerializer } = require("jest-emotion");
require("jest-styled-components");

expect.addSnapshotSerializer(createSerializer(emotion));
