# PowerShell script to extract Book of Mormon document structure from .docx
# Output to UTF-8 file for proper Hebrew rendering

$xmlPath = "$env:TEMP\docx_extract\word\document.xml"
$outputPath = "C:\Users\chris\Desktop\Hebrew BOM\document_structure.txt"

# Force UTF-8 output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Load XML
[xml]$doc = Get-Content $xmlPath -Encoding UTF8
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

# Get all paragraphs
$paragraphs = $doc.SelectNodes("//w:p", $ns)

# Book of Mormon book names (English)
$bomBooks = @(
    "1 Nephi", "2 Nephi", "Jacob", "Enos", "Jarom", "Omni",
    "Words of Mormon", "Mosiah", "Alma", "Helaman",
    "3 Nephi", "4 Nephi", "Mormon", "Ether", "Moroni"
)

# Collect all data
$results = [System.Collections.ArrayList]::new()
$headings = [System.Collections.ArrayList]::new()
$tocEntries = [System.Collections.ArrayList]::new()
$styleCount = @{}

foreach ($para in $paragraphs) {
    # Get paragraph style
    $styleNode = $para.SelectSingleNode("w:pPr/w:pStyle", $ns)
    $style = if ($styleNode) { $styleNode.GetAttribute("val", "http://schemas.openxmlformats.org/wordprocessingml/2006/main") } else { "Normal" }

    # Get all text runs combined
    $textNodes = $para.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $textNodes) {
        $fullText += $t.InnerText
    }
    $fullText = $fullText.Trim()
    if ($fullText -eq "") { continue }

    # Count styles
    if (-not $styleCount.ContainsKey($style)) { $styleCount[$style] = 0 }
    $styleCount[$style]++

    # Collect headings
    if ($style -match "^Heading[0-9]$" -or $style -eq "Title" -or $style -eq "Subtitle") {
        [void]$headings.Add("[$style] $fullText")
    }

    # Collect TOC entries
    if ($style -match "^TOC[0-9]$") {
        [void]$tocEntries.Add("[$style] $fullText")
    }
}

# Build output
$sb = [System.Text.StringBuilder]::new()

[void]$sb.AppendLine("HEBREW BOOK OF MORMON - DOCUMENT STRUCTURE ANALYSIS")
[void]$sb.AppendLine("=" * 70)
[void]$sb.AppendLine("File: Hebrew_BOM_20_February_2026.docx")
[void]$sb.AppendLine("Total paragraphs: $($paragraphs.Count)")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("PARAGRAPH STYLE USAGE:")
[void]$sb.AppendLine("-" * 40)
foreach ($kv in ($styleCount.GetEnumerator() | Sort-Object Name)) {
    [void]$sb.AppendLine("  $($kv.Key): $($kv.Value) paragraphs")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("=" * 70)
[void]$sb.AppendLine("TABLE OF CONTENTS ENTRIES ($($tocEntries.Count) entries):")
[void]$sb.AppendLine("-" * 40)
foreach ($toc in $tocEntries) {
    [void]$sb.AppendLine("  $toc")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("=" * 70)
[void]$sb.AppendLine("ALL HEADINGS ($($headings.Count) total):")
[void]$sb.AppendLine("-" * 40)
foreach ($h in $headings) {
    [void]$sb.AppendLine("  $h")
}

# Write to file with UTF-8 BOM encoding
[System.IO.File]::WriteAllText($outputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

Write-Host "Output written to: $outputPath"
Write-Host "Total headings: $($headings.Count)"
Write-Host "Total TOC entries: $($tocEntries.Count)"
