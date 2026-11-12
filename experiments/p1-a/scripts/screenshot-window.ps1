# Captures the P1-A app window via PrintWindow (PW_RENDERFULLCONTENT) —
# does not require foreground focus, so it cannot capture unrelated windows.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Pw {
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

$exe = "C:\Users\REDEYE\AppData\Local\p1-a\p1-a.exe"
$proc = Start-Process -FilePath $exe -PassThru

# poll until the real window exists (title non-empty, rect sane) or 30 s elapse
$h = [IntPtr]::Zero
$w = 0; $hgt = 0
$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    $p = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
    if (-not $p) { throw "app exited unexpectedly" }
    if ($p.MainWindowTitle -and $p.MainWindowHandle -ne [IntPtr]::Zero) {
        $rect = New-Object Win32Pw+RECT
        [void][Win32Pw]::GetWindowRect($p.MainWindowHandle, [ref]$rect)
        $w = $rect.Right - $rect.Left
        $hgt = $rect.Bottom - $rect.Top
        if ($w -gt 100 -and $hgt -gt 100) {
            $h = $p.MainWindowHandle
            break
        }
    }
}
if ($h -eq [IntPtr]::Zero) { throw "real window never appeared within 30 s" }
Write-Output "handle=$h title=$($p.MainWindowTitle) rect ${w}x${hgt}"

$bmp = New-Object System.Drawing.Bitmap($w, $hgt)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
# 2 = PW_RENDERFULLCONTENT (needed for DirectComposition/WebView2 content)
$ok = [Win32Pw]::PrintWindow($h, $hdc, 2)
$g.ReleaseHdc($hdc)
Write-Output "PrintWindow ok=$ok"
$dest = "D:\TechVault\experiments\p1-a\results\screenshots\desktop-window.png"
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Stop-Process -Id $proc.Id -Force
Write-Output "saved: $dest"
