# Bring the benchmark target window to the front (topmost) so rAF is not throttled.
param([string]$ProcName = "msedge")
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class FT {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[FT]::SetProcessDPIAware() | Out-Null
$p = Get-Process $ProcName -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($p) {
  [void][FT]::ShowWindow($p.MainWindowHandle, 9)  # SW_RESTORE
  [void][FT]::SetWindowPos($p.MainWindowHandle, [IntPtr](-1), 0, 0, 0, 0, 0x43)
  [void][FT]::SetForegroundWindow($p.MainWindowHandle)
  Write-Output "front: $($p.ProcessName) '$($p.MainWindowTitle)'"
} else {
  Write-Output "no-window"
}
