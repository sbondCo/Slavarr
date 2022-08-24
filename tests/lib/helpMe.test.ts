const { makeATable } = require("../../out/lib/helpMe");

test("making a table", () => {
  expect(
    makeATable([
      ["Name", "Year"],
      ["The Terminator", "1984"]
    ])
  ).toMatch(`+-----------------------+
| Name           | Year |
+-----------------------+
| The Terminator | 1984 |
+-----------------------+`);
});
