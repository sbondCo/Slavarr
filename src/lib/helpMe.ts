export function makeATable(rows: string[][]) {
  let table = [];
  let longest = [0, 0, 0];

  // 1. Calculate longest text for each column and store in `longest` array.
  for (const k in rows) {
    const row = rows[k];
    for (const rk in row) {
      const ri = String(row[rk]);
      if (longest[rk] < ri.length) longest[rk] = ri.length;
    }
  }

  // 2. Add rows to `table` array and pad every cell to match longest one.
  for (const k in rows) {
    const row = rows[k];
    const tmp = [];
    for (const rk in row) {
      const ri = String(row[rk]);
      tmp.push(ri.padEnd(longest[rk]));
    }
    table.push(tmp);
  }

  // 3. Join each row in table (adding a seperator) to `tbl` string.
  let tbl = "";
  for (let i = 0; i < table.length; i++) {
    const row = table[i];
    const rowCont = row.join(" | ");
    tbl += rowCont;
    tbl += "\n";
    tbl += "".padEnd(rowCont.length, "-");
    tbl += "\n";
  }

  return tbl;
}
