// diagnostic: navigate + capture runtime exceptions + console + title/status
const port = parseInt(process.argv[2] || "9223", 10);
const url = process.argv[3];
const waitMs = parseInt(process.argv[4] || "15000", 10);
const res = await fetch(`http://127.0.0.1:${port}/json/list`);
const targets = await res.json();
const page = targets.find(t => t.type === "page" && (t.url || "").includes("127.0.0.1:4173")) || targets.find(t => t.type === "page");
console.log("target url:", page.url);
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  else if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    console.log("EXCEPTION:", d.text, JSON.stringify(d.exception?.description || "").slice(0, 300));
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    console.log("CONSOLE-ERROR:", JSON.stringify(m.params.args).slice(0, 300));
  }
};
const send = (method, params = {}) => new Promise((res2, rej2) => { const i = ++id; pending.set(i, res2); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
await send("Page.navigate", { url });
for (let k = 1; k * 3000 <= waitMs; k++) {
  await new Promise(r => setTimeout(r, 3000));
  try {
    const t = await Promise.race([
      send("Runtime.evaluate", { expression: "document.title + ' | STATUS: ' + (document.getElementById('status')?.textContent||'')", returnByValue: true }),
      new Promise(r2 => setTimeout(() => r2({ timeout: true }), 2500)),
    ]);
    console.log(`t+${k*3}s:`, t.timeout ? "EVAL-HUNG (main thread blocked?)" : t.result?.value);
    if (!t.timeout && /BENCH_DONE/.test(t.result?.value || "")) break;
  } catch (e) { console.log(`t+${k*3}s eval error:`, String(e).slice(0, 120)); }
}
