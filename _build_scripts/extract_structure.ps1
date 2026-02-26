# PowerShell script to extract Book of Mormon document structure from .docx
# The .docx has already been extracted to /tmp/docx_extract

$xmlPath = "C:\Users\chris\AppData\Local\Temp\docx_extract\word\document.xml"

# For Git Bash compatibility, also try the unix-style path
if (-not (Test-Path $xmlPath)) {
    # Try alternative paths
    $possiblePaths = @(
        "$env:TEMP\docx_extract\word\document.xml",
        "C:\tmp\docx_extract\word\document.xml"
    )
    foreach ($p in $possiblePaths) {
        if (Test-Path $p) {
            $xmlPath = $p
            break
        }
    }
}

Write-Host "Loading document from: $xmlPath"
Write-Host ""

# Load XML with namespace handling
[xml]$doc = Get-Content $xmlPath -Encoding UTF8
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

# Get all paragraphs
$paragraphs = $doc.SelectNodes("//w:p", $ns)
Write-Host "Total paragraphs found: $($paragraphs.Count)"
Write-Host ""

# Book of Mormon book names to search for
$bomBooks = @(
    "1 Nephi", "2 Nephi", "Jacob", "Enos", "Jarom", "Omni",
    "Words of Mormon", "Mosiah", "Alma", "Helaman",
    "3 Nephi", "4 Nephi", "Mormon", "Ether", "Moroni"
)

# Also Hebrew equivalents that might appear
$hebrewPattern = "נפי|יעקב|עינוש|ירום|עמני|מלים של מורמון|מוסיה|אלמא|הילמן|מורמון|אתר|מורוני"

# Track findings
$headings = @()
$bookChapterMatches = @()
$allStyles = @{}

$counter = 0
foreach ($para in $paragraphs) {
    $counter++

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

    # Track style usage
    if (-not $allStyles.ContainsKey($style)) {
        $allStyles[$style] = 0
    }
    $allStyles[$style]++

    # Check if it's a heading style
    $isHeading = $style -match "^Heading[0-9]$" -or $style -eq "Title" -or $style -eq "Subtitle" -or $style -eq "TOCHeading"

    if ($isHeading) {
        $headings += [PSCustomObject]@{
            Style = $style
            Text = $fullText
            ParaIndex = $counter
        }
    }

    # Check for Book of Mormon book/chapter references in English
    foreach ($book in $bomBooks) {
        if ($fullText -match [regex]::Escape($book)) {
            $bookChapterMatches += [PSCustomObject]@{
                Style = $style
                Text = if ($fullText.Length -gt 200) { $fullText.Substring(0, 200) + "..." } else { $fullText }
                Book = $book
                ParaIndex = $counter
            }
        }
    }

    # Check for chapter patterns like "Chapter 1", "CHAPTER 1", etc.
    if ($fullText -match "(?i)(chapter|פרק)\s+\d+") {
        $bookChapterMatches += [PSCustomObject]@{
            Style = $style
            Text = if ($fullText.Length -gt 200) { $fullText.Substring(0, 200) + "..." } else { $fullText }
            Book = "Chapter marker"
            ParaIndex = $counter
        }
    }
}

Write-Host "=========================================="
Write-Host "DOCUMENT STYLE USAGE SUMMARY"
Write-Host "=========================================="
$allStyles.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host ("  {0,-30} : {1} paragraphs" -f $_.Key, $_.Value)
}

Write-Host ""
Write-Host "=========================================="
Write-Host "ALL HEADINGS FOUND ($($headings.Count) total)"
Write-Host "=========================================="
foreach ($h in $headings) {
    $displayText = if ($h.Text.Length -gt 150) { $h.Text.Substring(0, 150) + "..." } else { $h.Text }
    Write-Host ("  [{0}] Para#{1}: {2}" -f $h.Style, $h.ParaIndex, $displayText)
}

Write-Host ""
Write-Host "=========================================="
Write-Host "BOOK OF MORMON BOOK/CHAPTER REFERENCES ($($bookChapterMatches.Count) total)"
Write-Host "=========================================="

# Deduplicate and show unique entries
$seen = @{}
foreach ($m in $bookChapterMatches) {
    $key = "$($m.Style)|$($m.ParaIndex)"
    if (-not $seen.ContainsKey($key)) {
        $seen[$key] = $true
        Write-Host ("  [{0}] Para#{1} ({2}): {3}" -f $m.Style, $m.ParaIndex, $m.Book, $m.Text)
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "BOOKS AND CHAPTERS SUMMARY"
Write-Host "=========================================="

# Build a structured summary: which books appear and with what chapters
foreach ($book in $bomBooks) {
    $matches = $bookChapterMatches | Where-Object { $_.Book -eq $book }
    if ($matches.Count -gt 0) {
        Write-Host ""
        Write-Host "  $book ($($matches.Count) references):"
        $uniqueTexts = $matches | Select-Object -Property Text -Unique
        foreach ($ut in $uniqueTexts) {
            $shortText = if ($ut.Text.Length -gt 120) { $ut.Text.Substring(0, 120) + "..." } else { $ut.Text }
            Write-Host "    - $shortText"
        }
    }
}

# Show chapter markers separately
$chapterMarkers = $bookChapterMatches | Where-Object { $_.Book -eq "Chapter marker" }
if ($chapterMarkers.Count -gt 0) {
    Write-Host ""
    Write-Host "  Chapter Markers ($($chapterMarkers.Count) found):"
    $uniqueChapters = $chapterMarkers | Select-Object -Property Text -Unique
    foreach ($uc in $uniqueChapters) {
        $shortText = if ($uc.Text.Length -gt 120) { $uc.Text.Substring(0, 120) + "..." } else { $uc.Text }
        Write-Host "    - $shortText"
    }
}
