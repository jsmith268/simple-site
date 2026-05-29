import { deLiteralizeUnicode } from "@simplesight/agents";

const EMDASH = String.fromCodePoint(0x2014); // —
const RSQUO = String.fromCodePoint(0x2019); // ’
const EACUTE = String.fromCodePoint(0xe9); // é

// Inputs use String.raw so the LITERAL escape text (—) is the input.
const cases = [
  [String.raw`no upsell — just`, `no upsell ${EMDASH} just`], // dash → converted
  [String.raw`here’s the plan`, `here${RSQUO}s the plan`], // smart apostrophe → converted
  [String.raw`café menu`, `caf${EACUTE} menu`], // accent → converted
  [String.raw`it's fine`, String.raw`it's fine`], // ASCII apostrophe → MUST NOT convert (would break strings)
  [String.raw`path\\u2014x`, String.raw`path\\u2014x`], // doubled backslash → leave alone
  [String.raw`\u{1F600} hi`, `${String.fromCodePoint(0x1f600)} hi`], // \u{...} form → converted
];

let ok = true;
for (const [input, want] of cases) {
  const got = deLiteralizeUnicode(input);
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`${pass ? "PASS" : "FAIL"} :: ${JSON.stringify(input)} -> ${JSON.stringify(got)}${pass ? "" : `  (want ${JSON.stringify(want)})`}`);
}
console.log(ok ? "\nALL PASS" : "\nFAILURES");
process.exit(ok ? 0 : 1);
