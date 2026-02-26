[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Quick verification: check what the highest verse number is in a few chapters
$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)

$hebrewNumerals = @{}
$hebrewNumerals[[char]0x05D0] = 1
$hebrewNumerals[[char]0x05D1] = 2
$hebrewNumerals[[char]0x05D2] = 3
$hebrewNumerals[[char]0x05D3] = 4
$hebrewNumerals[[char]0x05D4] = 5
$hebrewNumerals[[char]0x05D5] = 6
$hebrewNumerals[[char]0x05D6] = 7
$hebrewNumerals[[char]0x05D7] = 8
$hebrewNumerals[[char]0x05D8] = 9
$hebrewNumerals[[char]0x05D9] = 10
$hebrewNumerals[[char]0x05DA] = 20
$hebrewNumerals[[char]0x05DB] = 20
$hebrewNumerals[[char]0x05DC] = 30
$hebrewNumerals[[char]0x05DD] = 40
$hebrewNumerals[[char]0x05DE] = 40
$hebrewNumerals[[char]0x05DF] = 50
$hebrewNumerals[[char]0x05E0] = 50
$hebrewNumerals[[char]0x05E1] = 60
$hebrewNumerals[[char]0x05E2] = 70
$hebrewNumerals[[char]0x05E3] = 80
$hebrewNumerals[[char]0x05E4] = 80
$hebrewNumerals[[char]0x05E5] = 90
$hebrewNumerals[[char]0x05E6] = 90
$hebrewNumerals[[char]0x05E7] = 100
$hebrewNumerals[[char]0x05E8] = 200
$hebrewNumerals[[char]0x05E9] = 300
$hebrewNumerals[[char]0x05EA] = 400

function ConvertFrom-HebrewNumeral {
    param([string]$heb)
    $total = 0
    foreach ($ch in $heb.ToCharArray()) {
        if ($hebrewNumerals.ContainsKey($ch)) {
            $total += $hebrewNumerals[$ch]
        }
    }
    return $total
}

# Check specific ranges - look at last few verses before chapter transitions
# 1 Nephi chapter 1 ends before P[170] (chapter 2)
Write-Output "=== Last verses of 1 Nephi ch1 (P[165]-P[169]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 165 -and $count -le 169) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            if ($trimmed -match '^([\u05D0-\u05EA]+)\.\s') {
                $vn = ConvertFrom-HebrewNumeral $Matches[1]
                Write-Output "P[$count] Verse $vn : $($Matches[1]). ..."
            } else {
                $short = if ($trimmed.Length -gt 60) { $trimmed.Substring(0,60) + "..." } else { $trimmed }
                Write-Output "P[$count] (non-verse): $short"
            }
        }
    }
    $count++
}

# Check around Moroni ch6 - expected 9 verses
# Moroni ch6 is at P[7149], ch7 at P[7159]
Write-Output ""
Write-Output "=== Moroni ch6 (P[7149]-P[7158]) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 7149 -and $count -le 7160) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            if ($trimmed -match '^([\u05D0-\u05EA]+)\.\s') {
                $vn = ConvertFrom-HebrewNumeral $Matches[1]
                Write-Output "P[$count] Verse $vn : $($Matches[1]). ..."
            } else {
                $short = if ($trimmed.Length -gt 60) { $trimmed.Substring(0,60) + "..." } else { $trimmed }
                Write-Output "P[$count] (non-verse): $short"
            }
        }
    }
    $count++
}

# Check the end of the document (Moroni 10)
Write-Output ""
Write-Output "=== Last paragraphs of the document (P[7290]-end) ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 7290) {
        $texts = $p.SelectNodes(".//w:t", $ns)
        $fullText = ""
        foreach ($t in $texts) {
            $fullText += $t.InnerText
        }
        $trimmed = $fullText.Trim()
        if ($trimmed -ne "") {
            if ($trimmed -match '^([\u05D0-\u05EA]+)\.\s') {
                $vn = ConvertFrom-HebrewNumeral $Matches[1]
                Write-Output "P[$count] Verse $vn : $($Matches[1]). ..."
            } else {
                $short = if ($trimmed.Length -gt 80) { $trimmed.Substring(0,80) + "..." } else { $trimmed }
                Write-Output "P[$count] (non-verse): $short"
            }
        }
    }
    $count++
}
