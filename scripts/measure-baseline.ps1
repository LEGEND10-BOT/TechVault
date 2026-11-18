# TechVault M0 baseline measurement (PERF-01/02; PHASE_2_PERFORMANCE_BUDGET.md §1)
#
# Measures, on the built release executable:
#   - startup: process start -> main window handle (ms), polled every 15 ms
#   - idle RAM over the COMPLETE application process tree (private bytes,
#     D-019 primary metric; working set recorded as supplementary), sampled
#     after the idle wait
#   - environment details (host, CPU, RAM, OS, power plan, build profile)
#
# Method carried over from the P1-A-validated scripts and adapted to
# process-tree aggregation (OD-7). This script MEASURES ONLY — it never
# asserts a pass/fail against a budget (baseline-only per M0).

param(
    [Parameter(Mandatory = $true)][string]$ExePath,
    [int]$Runs = 5,
    [int]$IdleWaitSeconds = 6,
    [switch]$Cold,                                # clear the WebView2 user-data cache before run 1
    [string]$OutJson = "D:\TechVault\docs\phase2-results\m0\baseline.json"
)

$ErrorActionPreference = "Stop"
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinWait {
    [DllImport("user32.dll")]
    public static extern uint WaitForInputIdle(IntPtr hProcess, uint dwMilliseconds);
}
"@

function Get-TreeRams {
    param([int]$RootPid)
    $all = Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -eq $RootPid }
    $level1 = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $RootPid }
    $all = @($all) + $level1
    foreach ($c in $level1) {
        $level2 = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $c.ProcessId }
        $all += $level2
    }
    $result = @()
    foreach ($p in $all) {
        try {
            $gp = Get-Process -Id $p.ProcessId -ErrorAction Stop
            $result += [PSCustomObject]@{
                Name          = $p.Name
                Pid           = $p.ProcessId
                WorkingSetMB  = [math]::Round($gp.WorkingSet64 / 1MB, 2)
                PrivateMB     = [math]::Round($gp.PrivateMemorySize64 / 1MB, 2)
            }
        } catch {}
    }
    return $result
}

function Get-EnvInfo {
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    $cs  = Get-CimInstance Win32_ComputerSystem
    $os  = Get-CimInstance Win32_OperatingSystem
    return [ordered]@{
        host           = $env:COMPUTERNAME
        cpu            = $cpu.Name.Trim()
        cpu_cores      = $cpu.NumberOfCores
        cpu_threads    = $cpu.NumberOfLogicalProcessors
        ram_gb         = [math]::Round($cs.TotalPhysicalMemory / 1GB, 1)
        os_caption     = $os.Caption
        os_version     = $os.Version
        measured_at    = (Get-Date).ToString("o")
        exe            = $ExePath
        runs           = $Runs
        idle_wait_s    = $IdleWaitSeconds
    }
}

$out = [ordered]@{
    tool          = "scripts/measure-baseline.ps1"
    methodology   = @(
        "startup = time from Start-Process until MainWindowHandle != 0, polled every 15 ms (P1-A method)",
        "idle RAM = PrivateMemorySize64 (private bytes, D-019 primary metric) summed over the complete app process tree: main process + WebView2 children (two parent levels); WorkingSet64 recorded as supplementary",
        "sampled after $IdleWaitSeconds s of idle; no jobs run (M0 has none)",
        "run 1 is cold (WebView2 user-data cache cleared) when -Cold is given; remaining runs are warm",
        "this script measures only; it never asserts pass/fail against a budget"
    )
    environment   = (Get-EnvInfo)
    startup_runs  = @()
    idle_samples  = @()
}

if ($Cold) {
    $udd = Join-Path $env:APPDATA "com.techvault.app\EBWebView"
    if (Test-Path $udd) {
        Remove-Item -Recurse -Force $udd
        $out.environment.cold_note = "cleared $udd before run 1"
    } else {
        $out.environment.cold_note = "no WebView2 user-data dir found (first-ever launch)"
    }
} else {
    $out.environment.cold_note = "not requested"
}

for ($i = 1; $i -le $Runs; $i++) {
    $t0 = [System.Diagnostics.Stopwatch]::StartNew()
    $proc = Start-Process -FilePath $ExePath -PassThru
    $handleMs = -1
    while ($t0.ElapsedMilliseconds -lt 30000) {
        $p = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
        if ($p -and $p.HasExited -ne $true -and $p.MainWindowHandle -ne 0) {
            $handleMs = $t0.ElapsedMilliseconds
            break
        }
        Start-Sleep -Milliseconds 15
    }
    [void][WinWait]::WaitForInputIdle($proc.Handle, 10000)

    Start-Sleep -Seconds $IdleWaitSeconds
    $rams = Get-TreeRams -RootPid $proc.Id
    $totalPriv = ($rams | Measure-Object PrivateMB -Sum).Sum
    $totalWs   = ($rams | Measure-Object WorkingSetMB -Sum).Sum

    $out.startup_runs += [ordered]@{
        run                 = $i
        kind                = $(if ($i -eq 1 -and $Cold) { "cold" } else { "warm" })
        to_main_window_ms   = $handleMs
    }
    $out.idle_samples += [ordered]@{
        run                 = $i
        tree_private_mb     = [math]::Round($totalPriv, 2)
        tree_working_set_mb = [math]::Round($totalWs, 2)
        process_count       = $rams.Count
        processes           = $rams
    }

    # Cleanup: stop the app and any lingering WebView2 children from this tree.
    try {
        $children = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $proc.Id }
        foreach ($c in $children) { try { Stop-Process -Id $c.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    } catch {}
    Start-Sleep -Seconds 2
}

# Summary: median/p95 across warm runs (and cold separately when present).
$warm = @($out.startup_runs | Where-Object kind -eq "warm" | ForEach-Object { $_.to_main_window_ms } | Sort-Object)
$priv = @($out.idle_samples | ForEach-Object { $_.tree_private_mb } | Sort-Object)
function Median($a) { if ($a.Count -eq 0) { return $null }; $m = [int][math]::Floor(($a.Count - 1) / 2); return $a[$m] }
function P95($a)    { if ($a.Count -eq 0) { return $null }; $idx = [int][math]::Ceiling(0.95 * $a.Count) - 1; return $a[[Math]::Max(0, [Math]::Min($idx, $a.Count - 1))] }

$out.summary = [ordered]@{
    startup_median_warm_ms   = Median $warm
    startup_p95_warm_ms      = P95 $warm
    idle_private_mb_all_runs = $priv
    idle_private_median_mb   = Median $priv
    idle_private_p95_mb      = P95 $priv
    note                     = "baseline only - no pass/fail (PHASE_2_PERFORMANCE_BUDGET.md §6: M0 row)"
}

$json = $out | ConvertTo-Json -Depth 6
New-Item -ItemType Directory -Force -Path (Split-Path $OutJson) | Out-Null
Set-Content -Path $OutJson -Value $json -Encoding UTF8
Write-Output "saved: $OutJson"
Write-Output ("startup median warm: {0} ms | idle tree private median: {1} MB (p95 {2} MB)" -f $out.summary.startup_median_warm_ms, $out.summary.idle_private_median_mb, $out.summary.idle_private_p95_mb)
