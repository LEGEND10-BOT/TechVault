# TechVault P1-A (F1-01a) measurement script
# Measures: process-start -> main-window-handle time (startup proxy), idle RAM
# (app process + WebView2 child processes), on the INSTALLED release app.
# Method notes recorded in output. Planning targets are NOT asserted here;
# this script only measures.

param(
    [Parameter(Mandatory = $true)][string]$ExePath,
    [int]$Runs = 5,
    [int]$IdleWaitSeconds = 6
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
    $procs = Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -eq $RootPid }
    # walk children two levels (app -> msedgewebview2 -> msedgewebview2)
    $level1 = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $RootPid }
    $all = @($procs) + $level1
    foreach ($c in $level1) {
        $level2 = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $c.ProcessId }
        $all += $level2
    }
    $result = @()
    foreach ($p in $all) {
        try {
            $gp = Get-Process -Id $p.ProcessId -ErrorAction Stop
            $result += [PSCustomObject]@{
                Name = $p.Name
                Pid = $p.ProcessId
                WorkingSetMB = [math]::Round($gp.WorkingSet64 / 1MB, 2)
                PrivateMB = [math]::Round($gp.PrivateMemorySize64 / 1MB, 2)
            }
        } catch {}
    }
    return $result
}

$out = [ordered]@{
    exe = $ExePath
    measured_at = (Get-Date).ToString("o")
    host = $env:COMPUTERNAME
    startup_runs = @()
    ram_samples = @()
    method_notes = @(
        "startup = time from Start-Process call until MainWindowHandle != 0, polled every 15 ms; run 1 is first launch after install (cold-ish), runs 2..N warm",
        "ram = WorkingSet64/PrivateMemorySize64 of app process plus child msedgewebview2 processes (two parent levels), sampled after $IdleWaitSeconds s idle",
        "power plan: (Get-CimInstance Win32_PowerPlan where IsActive).ElementName recorded separately"
    )
}

$plan = (powercfg /getactivescheme) -join " "
$out.power_plan = $plan

# --- startup runs ---
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
    $idleStart = [System.Diagnostics.Stopwatch]::StartNew()
    [void][WinWait]::WaitForInputIdle($proc.Handle, 10000)
    $idleMs = $idleStart.ElapsedMilliseconds
    # let the auto test suite finish, then sample RAM in this same run
    Start-Sleep -Seconds $IdleWaitSeconds
    $rams = Get-TreeRams -RootPid $proc.Id
    $appWs = ($rams | Where-Object Name -eq "p1-a" | Measure-Object WorkingSetMB -Sum).Sum
    $totalWs = ($rams | Measure-Object WorkingSetMB -Sum).Sum
    $totalPriv = ($rams | Measure-Object PrivateMB -Sum).Sum
    $out.startup_runs += [ordered]@{
        run = $i
        to_main_window_ms = $handleMs
        wait_for_input_idle_ms = $idleMs
    }
    $out.ram_samples += [ordered]@{
        run = $i
        app_working_set_mb = $appWs
        tree_working_set_mb = [math]::Round($totalWs, 2)
        tree_private_mb = [math]::Round($totalPriv, 2)
        processes = $rams
    }
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
    Start-Sleep -Seconds 2
}

$json = $out | ConvertTo-Json -Depth 6
$dest = "D:\TechVault\experiments\p1-a\results\measurements.json"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
Set-Content -Path $dest -Value $json -Encoding UTF8
Write-Output "saved: $dest"
Write-Output $json
