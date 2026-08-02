// Ties a table number to a short checksum so the customer app can tell
// "this came from a printed QR code" apart from "someone typed a
// different number into the address bar". Not cryptographic security —
// this is a client-only static app with no backend to hold a real
// secret, and anyone reading the bundle could recompute the checksum —
// but it stops the actual, common failure mode: a guest (or a guest at
// another table) editing ?table=5 to ?table=6 by hand and silently
// placing an order against the wrong table.
const SALT = "servd-table-v1";

function checksum(table) {
  const str = `${SALT}:${table.toLowerCase()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

// Combined value carried in the QR link's single `table` param, e.g.
// "5.k3f9a2" — keeps old plain links (`?table=5`) from silently being
// treated as trusted once this ships.
export function encodeTableParam(table) {
  return `${table}.${checksum(table)}`;
}

// Returns the table number only if its checksum matches, else "".
export function decodeTableParam(raw) {
  const i = raw.lastIndexOf(".");
  if (i < 1) return "";
  const table = raw.slice(0, i);
  const tag = raw.slice(i + 1);
  if (!tag || checksum(table) !== tag) return "";
  return table;
}
