param(
    [switch]$Once
)

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

# Single instance: the installer launches the HUD immediately and the Startup
# shortcut launches it again at boot; without this guard two bars stack and
# closing one leaves the other behind (looks like it "won't close").
if (-not $Once) {
    $script:hudMutex = New-Object System.Threading.Mutex($false, "SSU_HUD_singleton")
    if (-not $script:hudMutex.WaitOne(0, $false)) { exit 0 }
}

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$script:statusScript = Join-Path $PSScriptRoot "status.mjs"
$script:node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $script:node) { $script:node = "node" }

function Get-Status {
    try {
        $out = & $script:node --no-warnings $script:statusScript 2>$null
        if (-not $out) { return $null }
        return ($out | ConvertFrom-Json)
    }
    catch { return $null }
}

# The status call can block for seconds (credits fetch allows 8s). Running it on the
# UI thread froze the bar every cycle, so ticks poll a background job instead: start
# one when none is running, apply its result when it lands.
$script:statusJob = $null
function Poll-Status {
    if ($script:statusJob) {
        if ($script:statusJob.State -eq "Completed") {
            $job = $script:statusJob
            $script:statusJob = $null
            try {
                $out = Receive-Job $job -ErrorAction Stop
                Remove-Job $job -Force -ErrorAction SilentlyContinue
                if ($out) { return ($out | ConvertFrom-Json) }
            }
            catch { return $null }
        }
        else { return "pending" }
    }
    $script:statusJob = Start-Job -ScriptBlock {
        param($nodeExe, $scriptPath)
        try {
            $o = & $nodeExe --no-warnings $scriptPath 2>$null
            if ($o) { $o }
        }
        catch { }
    } -ArgumentList $script:node, $script:statusScript
    return "pending"
}

function Format-Num([double]$n) {
    if ($n -ge 1000000) { return "{0:N1}M" -f ($n / 1000000) }
    if ($n -ge 1000) { return "{0:N0}k" -f ($n / 1000) }
    return "{0:N0}" -f $n
}

function Get-LevelColor([double]$leftPct) {
    if ($leftPct -lt 10) { return "#FF5C5C" }
    if ($leftPct -lt 30) { return "#FFB020" }
    return "#3DDC97"
}

# ---------- window ----------
$win = New-Object System.Windows.Window
$win.WindowStyle = "None"
$win.AllowsTransparency = $true
$win.Background = [Windows.Media.Brushes]::Transparent
$win.Topmost = $true
$win.ShowInTaskbar = $false
$win.Width = 560
$win.Height = 96
$win.WindowStartupLocation = "Manual"
$area = [System.Windows.SystemParameters]::WorkArea
$win.Left = $area.Right - 576
$win.Top = $area.Top + 8

$border = New-Object System.Windows.Controls.Border
$border.CornerRadius = New-Object System.Windows.CornerRadius 12
$border.Background = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.Color]::FromArgb(235, 14, 17, 22))
$border.BorderBrush = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.Color]::FromArgb(255, 38, 44, 56))
$border.BorderThickness = New-Object System.Windows.Thickness 1
$border.Padding = New-Object System.Windows.Thickness 14, 10, 14, 10
$win.Content = $border

$grid = New-Object System.Windows.Controls.Grid
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
$grid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
$border.Child = $grid

function New-Text($text, $size, $color, $bold) {
    $t = New-Object System.Windows.Controls.TextBlock
    $t.Text = $text
    $t.FontFamily = New-Object System.Windows.Media.FontFamily "Malgun Gothic, Segoe UI"
    $t.FontSize = $size
    $t.Foreground = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString($color))
    if ($bold) { $t.FontWeight = [Windows.FontWeights]::SemiBold }
    return $t
}

$head = New-Object System.Windows.Controls.StackPanel
$head.Orientation = "Horizontal"
$creditsLabel = New-Text "크레딧" 11 "#8B95A7" $false
$creditsValue = New-Text "-" 15 "#FFFFFF" $true
$creditsValue.Margin = New-Object System.Windows.Thickness 8, 0, 10, 0
$creditsPct = New-Text "" 11 "#8B95A7" $false
$sep = New-Text "   |   " 12 "#3A4150" $false
$ctxLabel = New-Text "컨텍스트" 11 "#8B95A7" $false
$ctxValue = New-Text "-" 15 "#FFFFFF" $true
$ctxValue.Margin = New-Object System.Windows.Thickness 8, 0, 10, 0
$modelText = New-Text "" 10 "#6F7A8C" $false
$modelText.VerticalAlignment = "Center"

foreach ($e in @($creditsLabel, $creditsValue, $creditsPct, $sep, $ctxLabel, $ctxValue, $modelText)) { [void]$head.Children.Add($e) }
$grid.Children.Add($head) | Out-Null

$bars = New-Object System.Windows.Controls.Grid
$bars.Margin = New-Object System.Windows.Thickness 0, 8, 0, 0
$col1 = New-Object System.Windows.Controls.ColumnDefinition
$col1.Width = New-Object System.Windows.GridLength 250
$col2 = New-Object System.Windows.Controls.ColumnDefinition
$col2.Width = New-Object System.Windows.GridLength 20
$col3 = New-Object System.Windows.Controls.ColumnDefinition
$col3.Width = New-Object System.Windows.GridLength 250
foreach ($c in @($col1, $col2, $col3)) { $bars.ColumnDefinitions.Add($c) }

function New-Bar {
    $outer = New-Object System.Windows.Controls.Border
    $outer.Height = 5
    $outer.CornerRadius = New-Object System.Windows.CornerRadius 3
    $outer.Background = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.Color]::FromArgb(255, 30, 35, 45))
    $inner = New-Object System.Windows.Controls.Border
    $inner.CornerRadius = New-Object System.Windows.CornerRadius 3
    $inner.HorizontalAlignment = "Left"
    $inner.Width = 0
    $inner.Background = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString("#3DDC97"))
    $outer.Child = $inner
    return @{ outer = $outer; inner = $inner }
}

$cbar = New-Bar
$kbar = New-Bar
[System.Windows.Controls.Grid]::SetColumn($cbar.outer, 0)
[System.Windows.Controls.Grid]::SetColumn($kbar.outer, 2)
$bars.Children.Add($cbar.outer) | Out-Null
$bars.Children.Add($kbar.outer) | Out-Null
[System.Windows.Controls.Grid]::SetRow($bars, 1)
$grid.Children.Add($bars) | Out-Null

$ctxLine = New-Text "" 10 "#6F7A8C" $false
$ctxLine.Margin = New-Object System.Windows.Thickness 0, 6, 0, 0
[System.Windows.Controls.Grid]::SetRow($ctxLine, 2)
$grid.Children.Add($ctxLine) | Out-Null

$close = New-Object System.Windows.Controls.TextBlock
$close.Text = "✕"
$close.FontSize = 15
$close.Padding = New-Object System.Windows.Thickness 12, 4, 12, 8
$close.Foreground = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString("#AEB9C9"))
$close.HorizontalAlignment = "Right"
$close.VerticalAlignment = "Top"
$close.Cursor = [System.Windows.Input.Cursors]::Hand
$close.ToolTip = "닫기 (Esc)"
$close.Add_MouseLeftButtonUp({ $win.Close() })
$grid.Children.Add($close) | Out-Null

$border.Cursor = [System.Windows.Input.Cursors]::SizeAll
$border.Add_MouseLeftButtonDown({ try { $win.DragMove() } catch { } })
# Exit paths beyond the ✕: right-click menu anywhere on the bar, and Esc.
$menu = New-Object System.Windows.Controls.ContextMenu
$miClose = New-Object System.Windows.Controls.MenuItem
$miClose.Header = "HUD 닫기"
$miClose.Add_Click({ $win.Close() })
$menu.Items.Add($miClose) | Out-Null
$border.ContextMenu = $menu
$win.Add_KeyDown({ if ($_.Key -eq [System.Windows.Input.Key]::Escape) { $win.Close() } })

# ---------- update ----------
function Apply-Status($s) {
    if (-not $s) {
        $creditsValue.Text = "-"
        $creditsPct.Text = "(상태 조회 실패)"
        $ctxValue.Text = "-"
        $ctxLine.Text = "node·status.mjs·세션 DB 중 하나에 문제가 있습니다. 터미널에서 node hud/status.mjs 로 확인하세요"
        return
    }

    if ($s.credits -and $s.credits.ok) {
        $r = [double]$s.credits.remaining
        $q = [double]$s.credits.quota
        $p = [double]$s.credits.pct
        $creditsValue.Text = "{0:N0} / {1:N0}" -f $r, $q
        $creditsPct.Text = "({0:N1}%)" -f $p
        $col = Get-LevelColor $p
        $creditsPct.Foreground = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString($col))
        $cbar.inner.Background = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString($col))
        $cbar.inner.Width = [Math]::Max(0, [Math]::Min(250, 250 * $p / 100))
    }
    else {
        $creditsValue.Text = "-"
        $creditsPct.Text = "(키 없음 또는 조회 실패)"
    }

    if ($s.context -and $s.context.ok) {
        $used = [double]$s.context.context
        $limit = [double]$s.context.limit
        $modelText.Text = $s.context.model
        if ($limit -gt 0) {
            $p = 100 * $used / $limit
            $ctxValue.Text = "{0} / {1}" -f (Format-Num $used), (Format-Num $limit)
            $col = Get-LevelColor (100 - $p)
            $kbar.inner.Background = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString($col))
            $kbar.inner.Width = [Math]::Max(0, [Math]::Min(250, 250 * $p / 100))
            $line = "세션 {0}   캐시 {1}   남은 창 {2:N0}%" -f ([string]$s.context.session).Substring(0, 12), (Format-Num $s.context.cached), (100 - $p)
            if ($s.usage -and $s.usage.ok) {
                $line += "   누적 {0} 토큰 · 캐시 적중 {1:N1}%" -f (Format-Num $s.usage.total), [double]$s.usage.cacheRatio
            }
            $ctxLine.Text = $line
        }
        else {
            $ctxValue.Text = (Format-Num $used) + " tokens"
            $ctxLine.Text = "이 모델은 한도 정보가 없습니다"
        }
    }
    else {
        $ctxValue.Text = "-"
        if ($s.context -and $s.context.error) { $ctxLine.Text = "$($s.context.error)" }
        else { $ctxLine.Text = "OpenCode를 한 번 실행하면 세션이 생깁니다" }
    }
}

function Update-View {
    $r = Poll-Status
    if ($r -eq "pending") { return }
    Apply-Status $r
}

Apply-Status (Get-Status)
if ($Once) {
    $creditsValue.Text
    $ctxValue.Text
    $ctxLine.Text
    exit 0
}

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromSeconds(5)
$timer.Add_Tick({ Update-View })
$timer.Start()

[void]$win.ShowDialog()
