<script lang="ts">
  // TechVault P1-A PoC (F1-01a) automated validation suite — throwaway, no product UI.
  // Auto-runs on mount; writes machine-readable evidence via the save_test_results command.
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import { readTextFile } from "@tauri-apps/plugin-fs";
  import { open } from "@tauri-apps/plugin-dialog";

  interface SysInfoPayload {
    os: string;
    arch: string;
    family: string;
    app_version: string;
    timestamp_ms: number;
  }

  interface TestRow {
    name: string;
    status: "PASS" | "FAIL" | "RUN" | "INFO";
    detail: string;
  }

  interface Evidence {
    started_at: string;
    finished_at: string;
    sysinfo: SysInfoPayload | null;
    sysinfo_event: { received: boolean; latency_ms: number };
    ipc_ping: {
      calls: number;
      ok: number;
      failed: number;
      median_ms: number | null;
      p95_ms: number | null;
      min_ms: number | null;
      max_ms: number | null;
    };
    scoped_read: { path: string; ok: boolean; content_match: boolean; error: string | null };
    negative_tests: { path: string; rejected: boolean; error: string | null }[];
    ua: string;
  }

  const IPC_CALLS = 200;
  const FIXTURE_PATH = "D:\\TechVault\\experiments\\p1-a\\fixtures\\allowed\\sample.txt";
  const FIXTURE_CONTENT = "TECHVAULT_P1A_FIXTURE_OK";
  // Mandatory security negative test (owner handover): reading C:\Windows\win.ini
  // without an authorized file-picker selection must be rejected by the fs scope.
  const NEGATIVE_PATHS = ["C:\\Windows\\win.ini", "C:\\Windows\\system.ini"];

  let rows = $state<TestRow[]>([]);
  let sysinfo = $state<SysInfoPayload | null>(null);
  let running = $state(false);
  let dialogResult = $state("");
  let evidence: Evidence | null = null;
  let unlisten: UnlistenFn | null = null;

  function addRow(name: string, status: TestRow["status"], detail: string): void {
    rows = [...rows.filter((r) => r.name !== name), { name, status, detail }];
  }

  function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return Number.NaN;
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
  }

  function median(sorted: number[]): number {
    if (sorted.length === 0) return Number.NaN;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  async function saveEvidence(): Promise<string> {
    if (!evidence) return "no evidence";
    evidence.finished_at = new Date().toISOString();
    try {
      const path = await invoke<string>("save_test_results", {
        payload: JSON.stringify(evidence, null, 2),
      });
      return String(path);
    } catch (e) {
      return `save failed: ${String(e)}`;
    }
  }

  async function runSuite(): Promise<void> {
    if (running) return;
    running = true;
    rows = [];
    evidence = {
      started_at: new Date().toISOString(),
      finished_at: "",
      sysinfo: null,
      sysinfo_event: { received: false, latency_ms: -1 },
      ipc_ping: {
        calls: IPC_CALLS,
        ok: 0,
        failed: 0,
        median_ms: null,
        p95_ms: null,
        min_ms: null,
        max_ms: null,
      },
      scoped_read: { path: FIXTURE_PATH, ok: false, content_match: false, error: null },
      negative_tests: [],
      ua: navigator.userAgent,
    };

    // --- Rust -> JS event listener (armed before the command fires) ---
    let eventLatency = -1; // -1 = event not (yet) received
    let eventArrived = false;
    let eventSentAt = 0;
    try {
      unlisten = await listen<SysInfoPayload>("sysinfo-event", () => {
        eventArrived = true;
        eventLatency = performance.now() - eventSentAt;
      });
      addRow("event-listener", "INFO", "sysinfo-event listener armed");
    } catch (e) {
      addRow("event-listener", "FAIL", `listen failed: ${String(e)}`);
    }

    // --- sysinfo invoke + event validation ---
    try {
      eventSentAt = performance.now();
      sysinfo = await invoke<SysInfoPayload>("sysinfo");
      // give the event a moment to arrive
      for (let i = 0; i < 50 && !eventArrived; i++) {
        await new Promise((r) => setTimeout(r, 10));
      }
      evidence.sysinfo = sysinfo;
      evidence.sysinfo_event = {
        received: eventArrived,
        latency_ms: eventArrived && eventLatency >= 0 ? eventLatency : -1,
      };
      addRow(
        "sysinfo invoke",
        "PASS",
        `os=${sysinfo.os} arch=${sysinfo.arch} ver=${sysinfo.app_version}`,
      );
      addRow(
        "sysinfo event (Rust->JS)",
        eventArrived ? "PASS" : "FAIL",
        eventArrived && eventLatency >= 0
          ? `received in ${eventLatency.toFixed(2)} ms`
          : "no event within 500 ms",
      );
    } catch (e) {
      addRow("sysinfo invoke", "FAIL", String(e));
    }

    // --- IPC round-trip: 200 sequential small-payload calls (criterion A4) ---
    try {
      const latencies: number[] = [];
      let failed = 0;
      for (let i = 0; i < IPC_CALLS; i++) {
        const t0 = performance.now();
        try {
          const reply = await invoke<string>("ping");
          const dt = performance.now() - t0;
          if (reply === "pong") latencies.push(dt);
          else failed++;
        } catch {
          failed++;
        }
      }
      latencies.sort((a, b) => a - b);
      const med = median(latencies);
      const p95 = percentile(latencies, 95);
      evidence.ipc_ping = {
        calls: IPC_CALLS,
        ok: latencies.length,
        failed,
        median_ms: med,
        p95_ms: p95,
        min_ms: latencies[0] ?? null,
        max_ms: latencies[latencies.length - 1] ?? null,
      };
      addRow(
        `IPC ping x${IPC_CALLS}`,
        failed === 0 ? "PASS" : "FAIL",
        `ok=${latencies.length} failed=${failed} | median=${med.toFixed(2)} ms | p95=${p95.toFixed(2)} ms | min=${latencies[0]?.toFixed(2)} | max=${latencies[latencies.length - 1]?.toFixed(2)}`,
      );
    } catch (e) {
      addRow(`IPC ping x${IPC_CALLS}`, "FAIL", String(e));
    }

    // --- scoped fs read of the allowed fixture (criterion A5 positive path) ---
    try {
      const content = await readTextFile(FIXTURE_PATH);
      const match = content.trim() === FIXTURE_CONTENT;
      evidence.scoped_read = { path: FIXTURE_PATH, ok: true, content_match: match, error: null };
      addRow("scoped read (allowed path)", match ? "PASS" : "FAIL", match ? "content verified" : "content mismatch");
    } catch (e) {
      evidence.scoped_read = { path: FIXTURE_PATH, ok: false, content_match: false, error: String(e) };
      addRow("scoped read (allowed path)", "FAIL", String(e));
    }

    // --- mandatory negative tests: paths OUTSIDE the fs scope must be rejected ---
    for (const p of NEGATIVE_PATHS) {
      try {
        await readTextFile(p);
        evidence.negative_tests.push({ path: p, rejected: false, error: null });
        addRow(`negative read ${p}`, "FAIL", "READ SUCCEEDED — scope model did NOT reject");
      } catch (e) {
        evidence.negative_tests.push({ path: p, rejected: true, error: String(e) });
        addRow(`negative read ${p}`, "PASS", `rejected: ${String(e).slice(0, 120)}`);
      }
    }

    addRow("evidence file", "INFO", await saveEvidence());
    running = false;
  }

  // --- user-driven dialog flow (criterion A5 explicit user selection) ---
  async function pickAndRead(): Promise<void> {
    try {
      const selection = await open({
        multiple: false,
        directory: false,
        title: "TechVault P1-A: choose a text file",
      });
      if (!selection) {
        dialogResult = "dialog cancelled";
        return;
      }
      const path = typeof selection === "string" ? selection : selection[0];
      try {
        const content = await readTextFile(path);
        dialogResult = `OK (${path}): ${content.trim().slice(0, 200)}`;
      } catch (e) {
        dialogResult = `REJECTED (${path}): ${String(e).slice(0, 200)}`;
      }
    } catch (e) {
      dialogResult = `dialog error: ${String(e)}`;
    }
  }

  onMount(() => {
    void runSuite();
    return () => {
      unlisten?.();
    };
  });
</script>

<main class="container">
  <h1>TechVault P1-A PoC — F1-01a validation</h1>

  <section class="panel">
    <div class="sysinfo" data-testid="sysinfo">
      {#if sysinfo}
        <span>os: {sysinfo.os}</span>
        <span>arch: {sysinfo.arch}</span>
        <span>family: {sysinfo.family}</span>
        <span>app version: {sysinfo.app_version}</span>
      {:else}
        <span>sysinfo pending…</span>
      {/if}
    </div>
    <div class="actions">
      <button onclick={() => void runSuite()} disabled={running}>
        {running ? "running…" : "re-run suite"}
      </button>
      <button onclick={() => void pickAndRead()} disabled={running}>pick file via dialog</button>
    </div>
    {#if dialogResult}
      <p class="dialog-result" data-testid="dialog-result">{dialogResult}</p>
    {/if}
  </section>

  <table data-testid="results">
    <thead>
      <tr><th>test</th><th>status</th><th>detail</th></tr>
    </thead>
    <tbody>
      {#each rows as row (row.name)}
        <tr class={row.status.toLowerCase()}>
          <td>{row.name}</td>
          <td class="status">{row.status}</td>
          <td class="detail">{row.detail}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  :global(html, body) {
    background-color: #14121a;
    color: #e6e4ee;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 13px;
    margin: 0;
  }
  .container {
    max-width: 880px;
    margin: 0 auto;
    padding: 16px;
  }
  h1 {
    font-size: 16px;
    font-weight: 600;
    color: #b8a6ff;
  }
  .panel {
    border: 1px solid #3a3550;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background-color: #1c1926;
  }
  .sysinfo {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 8px;
    color: #9d96b8;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
  button {
    background-color: #2a2439;
    color: #e6e4ee;
    border: 1px solid #4a4160;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .dialog-result {
    margin: 8px 0 0;
    color: #ffd479;
    word-break: break-all;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    text-align: left;
    border-bottom: 1px solid #2a2439;
    padding: 5px 8px;
    vertical-align: top;
  }
  th {
    color: #9d96b8;
    font-weight: 500;
  }
  td.status {
    font-weight: 700;
    white-space: nowrap;
  }
  tr.pass .status { color: #6fe0a8; }
  tr.fail .status { color: #ff7a7a; }
  tr.run .status { color: #ffd479; }
  tr.info .status { color: #8f8ab0; }
  .detail {
    word-break: break-all;
    color: #c5c1d6;
  }
</style>


