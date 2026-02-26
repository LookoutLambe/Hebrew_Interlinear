[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)

# Show paragraphs around the single-chapter books (Enos at P[1886])
Write-Output "=== Around Enos (P[1886]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 1880 -and $count -le 1930) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            # Show first 120 chars
            $display = if ($trimmed.Length -gt 120) { $trimmed.Substring(0, 120) + "..." } else { $trimmed }
            Write-Output "P[$count]: $display"
        }
    }
    $count++
}

Write-Output ""
Write-Output "=== Sample verse patterns from 1 Nephi ch1 (P[149]-P[170]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 149 -and $count -le 169) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            $display = if ($trimmed.Length -gt 100) { $trimmed.Substring(0, 100) + "..." } else { $trimmed }
            Write-Output "P[$count]: $display"
        }
    }
    $count++
}

Write-Output ""
Write-Output "=== Check for last verses of 1 Nephi ch1 (before ch2 at P[170]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 165 -and $count -le 175) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            $display = if ($trimmed.Length -gt 100) { $trimmed.Substring(0, 100) + "..." } else { $trimmed }
            Write-Output "P[$count]: $display"
        }
    }
    $count++
}

# Also check 4 Nephi (single chapter at P[6347])
Write-Output ""
Write-Output "=== Around 4 Nephi (P[6347]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 6345 -and $count -le 6410) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            $display = if ($trimmed.Length -gt 100) { $trimmed.Substring(0, 100) + "..." } else { $trimmed }
            Write-Output "P[$count]: $display"
        }
    }
    $count++
}
