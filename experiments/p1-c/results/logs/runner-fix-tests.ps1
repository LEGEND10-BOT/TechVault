# P1-C runner-fix verification harness (temporary, directive-approved).
# Extracts the ACTUAL fixed functions from the patched runner via the PowerShell AST
# (not copies), then exercises: (A) RIFF chunk-walking duration parsing incl. LIST
# chunks and the original jfk.wav defect case; (B) exit-code capture for one
# successful and one failing child process.
$ErrorActionPreference = "Stop"
$runner = "D:\TechVault\experiments\p1-c\Run-P1C-Desktop.ps1"
$tokens = $null; $parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($runner, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count -gt 0) { throw "runner has parse errors" }

$fnDur = $ast.Find({ param($a) $a -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $a.Name -eq "Get-WavDuration" }, $true)
$fnMeas = $ast.Find({ param($a) $a -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $a.Name -eq "Invoke-MeasuredProcess" }, $true)
if (-not $fnDur -or -not $fnMeas) { throw "functions not found in patched runner" }
. ([scriptblock]::Create($fnDur.Extent.Text))
. ([scriptblock]::Create($fnMeas.Extent.Text))
Write-Output "extracted patched functions: Get-WavDuration, Invoke-MeasuredProcess"

$tmp = "D:\TechVault\experiments\p1-c\results\logs"
function New-TestWav([string]$Path, [int]$SampleRate, [bool]$WithList, [double]$Seconds) {
    $dataBytes = [int]($SampleRate * 2 * $Seconds)   # mono, 16-bit
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)
    $bw.Write([Text.Encoding]::ASCII.GetBytes("RIFF"))
    $riffSize = 4 + (8+16) + $(if ($WithList) { 8+10 } else { 0 }) + (8+$dataBytes)
    $bw.Write([int]$riffSize)
    $bw.Write([Text.Encoding]::ASCII.GetBytes("WAVE"))
    $bw.Write([Text.Encoding]::ASCII.GetBytes("fmt ")); $bw.Write([int]16)
    $bw.Write([int16]1); $bw.Write([int16]1); $bw.Write([int]$SampleRate)
    $bw.Write([int]($SampleRate*2)); $bw.Write([int16]2); $bw.Write([int16]16)
    if ($WithList) { $bw.Write([Text.Encoding]::ASCII.GetBytes("LIST")); $bw.Write([int]10); $bw.Write([Text.Encoding]::ASCII.GetBytes("INFOtest10")) }
    $bw.Write([Text.Encoding]::ASCII.GetBytes("data")); $bw.Write([int]$dataBytes)
    $bw.Write((New-Object byte[] $dataBytes))
    $bw.Flush(); [IO.File]::WriteAllBytes($Path, $ms.ToArray()); $bw.Close()
}

$results = @()
function Assert([string]$Name, [bool]$Ok, [string]$Detail) { $script:results += [pscustomobject]@{ test=$Name; pass=$Ok; detail=$Detail }; Write-Output ("[{0}] {1} : {2}" -f ($(if ($Ok) {"PASS"} else {"FAIL"})), $Name, $Detail) }

# A1: WAV WITH a LIST chunk before data (the defect case shape)
$wavList = Join-Path $tmp "fixtest-list.wav"
New-TestWav -Path $wavList -SampleRate 16000 -WithList $true -Seconds 0.5
try {
    $d = Get-WavDuration $wavList
    Assert "A1 duration with LIST chunk" ($d -eq 0.5) "got $d s (expected 0.5)"
} catch { Assert "A1 duration with LIST chunk" $false "threw: $($_.Exception.Message)" }

# A2: the real jfk.wav (original defect case) -> 11.0
try {
    $d = Get-WavDuration "D:\Builds\whisper.cpp-p1c\samples\jfk.wav"
    Assert "A2 real jfk.wav" ($d -eq 11.0) "got $d s (expected 11.0)"
} catch { Assert "A2 real jfk.wav" $false "threw: $($_.Exception.Message)" }

# A3: plain WAV without extra chunks
$wavPlain = Join-Path $tmp "fixtest-plain.wav"
New-TestWav -Path $wavPlain -SampleRate 16000 -WithList $false -Seconds 0.25
try {
    $d = Get-WavDuration $wavPlain
    Assert "A3 plain WAV" ($d -eq 0.25) "got $d s (expected 0.25)"
} catch { Assert "A3 plain WAV" $false "threw: $($_.Exception.Message)" }

# A4: wrong sample rate must still throw the format-validation message
$wav8k = Join-Path $tmp "fixtest-8k.wav"
New-TestWav -Path $wav8k -SampleRate 8000 -WithList $false -Seconds 0.5
try {
    $d = Get-WavDuration $wav8k
    Assert "A4 wrong sample rate rejected" $false "returned $d instead of throwing"
} catch {
    Assert "A4 wrong sample rate rejected" ($_.Exception.Message -like "*16 kHz, mono, PCM 16-bit*") "threw: $($_.Exception.Message)"
}

# A5: non-WAV returns null (caller converts to the PCM-WAV error)
$txt = Join-Path $tmp "fixtest-notwav.bin"
[IO.File]::WriteAllBytes($txt, [Text.Encoding]::ASCII.GetBytes("definitely not a wave file"))
$d = Get-WavDuration $txt
Assert "A5 non-WAV returns null" ($null -eq $d) "returned: $d"

# B: exit-code capture — one successful, one failing child process
$out = Join-Path $tmp "fixtest-out.txt"; $err = Join-Path $tmp "fixtest-err.txt"
$ok = Invoke-MeasuredProcess "powershell.exe" @("-NoProfile","-Command","exit 0") $out $err
Assert "B1 successful process exit_code=0" ($ok.exit_code -eq 0) "exit_code=$($ok.exit_code) (previously null)"
$bad = Invoke-MeasuredProcess "powershell.exe" @("-NoProfile","-Command","exit 7") $out $err
Assert "B2 failing process exit_code=7" ($bad.exit_code -eq 7) "exit_code=$($bad.exit_code) (previously null)"
Assert "B3 null never equals pass (sanity)" ($null -ne $ok.exit_code -and $null -ne $bad.exit_code) "both exit codes non-null"

Write-Output "---- SUMMARY ----"
$pass = @($results | Where-Object { $_.pass }).Count
Write-Output "$pass/$($results.Count) checks passed"
$results | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 (Join-Path $tmp "runner-fix-test-results.json")
Write-Output "machine-readable: $(Join-Path $tmp 'runner-fix-test-results.json')"
