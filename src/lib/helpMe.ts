import { Interaction } from "discord.js";

/**
 * Make a table from 2d array of rows.
 * @param rows 2d array of rows to display - first entry in array should be header names.
 * @returns An ascii table.
 */
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
    const rowContent = `| ${row.join(" | ")} |`;
    const rowSeperator = "+" + "".padEnd(rowContent.length - 2, "-") + "+";

    if (i === 0) {
      tbl += rowSeperator;
      tbl += "\n";
      tbl += rowContent;
      tbl += "\n";
      tbl += rowSeperator;
    } else if (i + 1 === table.length) {
      tbl += rowContent;
      tbl += "\n";
      tbl += rowSeperator;
    } else {
      tbl += rowContent;
    }
    tbl += "\n";
  }

  return tbl;
}

/**
 * Gets user's id from interaction and matches it against the bot whitelist.
 * @param interaction Interaction.
 * @returns If users id is in whitelist, returns false, otherwise returns true.
 */
export function stopAbuse(interaction: Interaction): boolean {
  const whitelist = process.env.BOT_WHITELIST!.replaceAll(" ", "").split(",");

  if (!interaction.member?.user.id) return true;

  if (whitelist?.includes(interaction.member?.user.id)) return false;

  return true;
}
