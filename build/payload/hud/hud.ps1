param(
    [switch]$Once
)

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

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
$close.Text = "x"
$close.FontSize = 12
$close.Foreground = New-Object System.Windows.Media.SolidColorBrush ([Windows.Media.ColorConverter]::ConvertFromString("#6F7A8C"))
$close.HorizontalAlignment = "Right"
$close.VerticalAlignment = "Top"
$close.Cursor = [System.Windows.Input.Cursors]::Hand
$close.ToolTip = "닫기"
$close.Add_MouseLeftButtonUp({ $win.Close() })
$grid.Children.Add($close) | Out-Null

$border.Cursor = [System.Windows.Input.Cursors]::SizeAll
$border.Add_MouseLeftButtonDown({ try { $win.DragMove() } catch { } })

# ---------- update ----------
function Update-View {
    $s = Get-Status
    if (-not $s) {
        $creditsValue.Text = "-"
        $creditsPct.Text = "(node 또는 status.mjs 없음)"
        $ctxValue.Text = "-"
        $ctxLine.Text = "OpenCode를 한 번 실행하면 세션이 생깁니다"
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
            $ctxLine.Text = "세션 {0}   캐시 {1}   남은 창 {2:N0}%" -f ([string]$s.context.session).Substring(0, 12), (Format-Num $s.context.cached), (100 - $p)
        }
        else {
            $ctxValue.Text = (Format-Num $used) + " tokens"
            $ctxLine.Text = "이 모델은 한도 정보가 없습니다"
        }
    }
    else {
        $ctxValue.Text = "-"
        $ctxLine.Text = "$($s.context.error)"
    }
}

Update-View
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
