# P1-A closure addendum (directive D1): exercises the A5 dialog flow through the real UI.
# Drives the INSTALLED app: foregrounds it, clicks "pick file via dialog" with a real
# mouse click, selects the given path in the native Open dialog (UIA ValuePattern on the
# FileName edit + InvokePattern on Open), then dumps the in-app result text + screenshots.
# Read-only re: files — the app itself performs the (scoped) reads.
param(
    [Parameter(Mandatory = $true)][string]$SelectPath,
    [Parameter(Mandatory = $true)][string]$OutPng
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Pw3 {
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
    [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    public struct RECT { public int Left, Top, Right, Bottom; }
    public struct POINT { public int X, Y; }
}
"@
[void][Win32Pw3]::SetProcessDPIAware()

function Shot([IntPtr]$h, [string]$dest) {
    $r = New-Object Win32Pw3+RECT
    [void][Win32Pw3]::GetWindowRect($h, [ref]$r)
    $w = $r.Right - $r.Left; $hg = $r.Bottom - $r.Top
    if ($w -le 0 -or $hg -le 0) { Write-Output "shot-skip bad rect"; return }
    $bmp = New-Object System.Drawing.Bitmap($w, $hg)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $hdc = $g.GetHdc()
    $ok = [Win32Pw3]::PrintWindow($h, $hdc, 2)
    $g.ReleaseHdc($hdc)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Output "shot ok=$ok -> $dest ($w x $hg)"
}

function FindDialog([int]$appPid, [IntPtr]$appH) {
    $pidCond = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::ProcessIdProperty, $appPid)
    $wins = [System.Windows.Automation.AutomationElement]::RootElement.FindAll(
        [System.Windows.Automation.TreeScope]::Children, $pidCond)
    foreach ($w in $wins) {
        $cls = $w.Current.ClassName
        $ttl = $w.Current.Name
        if ($w.Current.NativeWindowHandle -ne $appH -and $cls -eq "#32770") {
            Write-Output "dialog found: title='$ttl' class='$cls' handle=$($w.Current.NativeWindowHandle)"
            return $w
        }
    }
    return $null
}

$proc = Get-Process p1-a -ErrorAction Stop | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { throw "p1-a main window not found" }
$appH = $proc.MainWindowHandle
$rootEl = [System.Windows.Automation.AutomationElement]::FromHandle($appH)
Write-Output "app window: '$($proc.MainWindowTitle)' handle=$appH"

# 0) a dialog may already be open (leftover run) — detect before clicking
$dlg = FindDialog $proc.Id $appH
$clicked = $false
if (-not $dlg) {
    # 1) find the button, elevate the app topmost, verify the click point, real-click it
    $btnCond = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::NameProperty, "pick file via dialog")
    $btn = $null
    $deadline = (Get-Date).AddSeconds(15)
    while (-not $btn -and (Get-Date) -lt $deadline) {
        $btn = $rootEl.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $btnCond)
        if (-not $btn) { Start-Sleep -Milliseconds 500 }
    }
    if (-not $btn) { throw "dialog button not found in UIA tree" }
    $r = $btn.Current.BoundingRectangle
    $cx = [int]($r.X + $r.Width / 2); $cy = [int]($r.Y + $r.Height / 2)
    Write-Output "button rect ($([math]::Round($r.X)),$([math]::Round($r.Y))) size ($([math]::Round($r.Width)) x $([math]::Round($r.Height))) -> click at ($cx,$cy)"

    [void][Win32Pw3]::SetWindowPos($appH, [IntPtr](-1), 0, 0, 0, 0, 0x43)  # topmost, keep size/pos
    [void][Win32Pw3]::SetForegroundWindow($appH)
    Start-Sleep -Milliseconds 400
    $pt = New-Object Win32Pw3+POINT
    $pt.X = $cx; $pt.Y = $cy
    $root = [Win32Pw3]::GetAncestor([Win32Pw3]::WindowFromPoint($pt), 2)
    if ($root -ne $appH) { throw "click point ($cx,$cy) does not resolve to the app window (root=$root)" }
    Write-Output "click point verified over app window"
    [void][Win32Pw3]::SetCursorPos($cx, $cy)
    Start-Sleep -Milliseconds 120
    [Win32Pw3]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
    Start-Sleep -Milliseconds 60
    [Win32Pw3]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
    $clicked = $true
    Write-Output "real click sent"
    # wait briefly; if the dialog did not open, fall back to keyboard activation
    $deadline = (Get-Date).AddSeconds(4)
    while (-not $dlg -and (Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 300
        $dlg = FindDialog $proc.Id $appH
    }
    if (-not $dlg) {
        Write-Output "click did not open the dialog; keyboard fallback (SetFocus + SPACE)"
        [void][Win32Pw3]::SetForegroundWindow($appH)
        Start-Sleep -Milliseconds 200
        $btn.SetFocus()
        Start-Sleep -Milliseconds 300
        [Win32Pw3]::keybd_event(0x20, 0, 0, [UIntPtr]::Zero)   # VK_SPACE down
        Start-Sleep -Milliseconds 80
        [Win32Pw3]::keybd_event(0x20, 0, 2, [UIntPtr]::Zero)   # VK_SPACE up (KEYEVENTF_KEYUP)
    }
}

# 2) wait for the native Open dialog
if (-not $dlg) {
    $deadline = (Get-Date).AddSeconds(10)
    while (-not $dlg -and (Get-Date) -lt $deadline) {
        Start-Sleep -Milliseconds 300
        $dlg = FindDialog $proc.Id $appH
    }
}
if (-not $dlg) {
    Shot $appH "$OutPng.nodialog.png"
    throw "native Open dialog did not appear"
}
$dlgH = [IntPtr]$dlg.Current.NativeWindowHandle
Shot $dlgH "$OutPng.dialog.png"

# 3) type the path into the File name edit and invoke Open
$editCond = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::AutomationIdProperty, "FileName")
$edit = $dlg.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $editCond)
if (-not $edit) {
    $editCond2 = New-Object System.Windows.Automation.PropertyCondition(
        [System.Windows.Automation.AutomationElement]::NameProperty, "File name:")
    $edit = $dlg.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $editCond2)
}
if (-not $edit) { throw "File name edit not found in dialog" }
$vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$vp.SetValue($SelectPath)
Write-Output "path set: $SelectPath"
$openCond = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::AutomationIdProperty, "Open")
$openBtn = $dlg.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $openCond)
if (-not $openBtn) { throw "Open button not found" }
[void]$openBtn.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
Write-Output "Open invoked"

Start-Sleep -Seconds 2

# 4) dump the in-app result paragraph
$all = $rootEl.FindAll([System.Windows.Automation.TreeScope]::Descendants,
    [System.Windows.Automation.Condition]::TrueCondition)
$resultText = ""
foreach ($el in $all) {
    try {
        $n = $el.Current.Name
        if ($n -and ($n.StartsWith("OK (") -or $n.StartsWith("REJECTED (") -or $n.StartsWith("dialog "))) {
            $resultText = $n
            break
        }
    } catch {}
}
Write-Output "RESULT-TEXT: $resultText"
Shot $appH $OutPng
# restore non-topmost band for the app
[void][Win32Pw3]::SetWindowPos($appH, [IntPtr](-2), 0, 0, 0, 0, 0x43)
Write-Output "DONE"
