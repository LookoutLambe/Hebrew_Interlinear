<#
.SYNOPSIS
Extract Book of Mormon document structure from Hebrew .docx file
#>

$xmlPath = "$env:TEMP\docx_extract\word\document.xml"
$outputPath = [System.IO.Path]::Combine("C:\Users\chris\Desktop\Hebrew BOM", "document_structure_final.txt")

# Load XML
[xml]$doc = Get-Content $xmlPath -Encoding UTF8
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $doc.SelectNodes("//w:p", $ns)

# Build structure: collect Heading1 (books) and Heading2 (chapters) in order
$structure = [System.Collections.ArrayList]::new()
$currentBook = $null
$tocEntries = [System.Collections.ArrayList]::new()

foreach ($para in $paragraphs) {
    $styleNode = $para.SelectSingleNode("w:pPr/w:pStyle", $ns)
    $style = if ($styleNode) { $styleNode.GetAttribute("val", "http://schemas.openxmlformats.org/wordprocessingml/2006/main") } else { "Normal" }

    $textNodes = $para.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $textNodes) { $fullText += $t.InnerText }
    $fullText = $fullText.Trim()
    if ($fullText -eq "") { continue }

    if ($style -match "^TOC") {
        [void]$tocEntries.Add($fullText)
    }

    if ($style -eq "Heading1") {
        $currentBook = @{
            Name = $fullText
            Chapters = [System.Collections.ArrayList]::new()
        }
        [void]$structure.Add($currentBook)
    }

    if ($style -eq "Heading2" -and $null -ne $currentBook) {
        [void]$currentBook.Chapters.Add($fullText)
    }
}

# Build output using StringBuilder
$sb = [System.Text.StringBuilder]::new()

[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("HEBREW BOOK OF MORMON - COMPLETE DOCUMENT STRUCTURE ANALYSIS")
[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("File: Hebrew_BOM_20_February_2026.docx")
[void]$sb.AppendLine("Total paragraphs: $($paragraphs.Count)")
[void]$sb.AppendLine("")

[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("TABLE OF CONTENTS ENTRIES")
[void]$sb.AppendLine(("-" * 80))
foreach ($toc in $tocEntries) {
    [void]$sb.AppendLine("  $toc")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("ALL BOOKS AND THEIR CHAPTERS (Heading1 = Book, Heading2 = Chapter)")
[void]$sb.AppendLine(("-" * 80))
[void]$sb.AppendLine("")

$bookNum = 0
$totalChapters = 0
foreach ($book in $structure) {
    $bookNum++
    $chapCount = $book.Chapters.Count
    $totalChapters += $chapCount
    [void]$sb.AppendLine("BOOK $bookNum : $($book.Name)  [$chapCount chapters]")
    if ($chapCount -gt 0) {
        foreach ($ch in $book.Chapters) {
            [void]$sb.AppendLine("    $ch")
        }
    } else {
        [void]$sb.AppendLine("    (no chapter sub-headings - single chapter or appendix section)")
    }
    [void]$sb.AppendLine("")
}

[void]$sb.AppendLine(("-" * 80))
[void]$sb.AppendLine("SUMMARY: $bookNum books/sections found, $totalChapters total chapter headings")
[void]$sb.AppendLine("")

# Write Hebrew-English mapping table based on known correspondences
# We identify them by position in the document
$bomEnglish = @(
    "1 Nephi", "2 Nephi", "Jacob", "Enos", "Jarom", "Omni",
    "Words of Mormon", "Mosiah", "Alma", "Helaman",
    "3 Nephi", "4 Nephi", "Mormon", "Ether", "Moroni"
)

$bomExpected = @(22, 33, 7, 1, 1, 1, 1, 29, 63, 16, 30, 1, 9, 15, 10)

[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("BOOK OF MORMON BOOKS - HEBREW/ENGLISH MAPPING AND COMPLETENESS CHECK")
[void]$sb.AppendLine(("-" * 80))
[void]$sb.AppendLine("")

# The first 15 Heading1 entries should be BOM books
$bomBookCount = [Math]::Min($structure.Count, 15)

for ($i = 0; $i -lt $bomBookCount; $i++) {
    $book = $structure[$i]
    $english = $bomEnglish[$i]
    $expected = $bomExpected[$i]
    $found = $book.Chapters.Count

    # For single-chapter books without subheadings
    $effective = $found
    if ($expected -eq 1 -and $found -eq 0) {
        $effective = 1
    }

    if ($effective -eq $expected) {
        $status = "COMPLETE"
    } elseif ($effective -gt $expected) {
        $status = "EXTRA ($effective found, $expected expected)"
    } else {
        $status = "INCOMPLETE ($effective found, $expected expected)"
        # List found chapter names to help identify what's missing
    }

    [void]$sb.AppendLine(("{0,2}. {1,-25} = {2}" -f ($i+1), $english, $book.Name))
    [void]$sb.AppendLine(("    Chapters found: $found heading(s), Expected: $expected  --> $status"))

    # Check for gaps by looking at chapter heading sequence
    if ($found -gt 0 -and $found -ne $expected) {
        [void]$sb.AppendLine("    Chapter headings present:")
        foreach ($ch in $book.Chapters) {
            [void]$sb.AppendLine("      $ch")
        }
    }
    [void]$sb.AppendLine("")
}

# Remaining sections (glossary/appendix)
if ($structure.Count -gt 15) {
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine(("=" * 80))
    [void]$sb.AppendLine("APPENDIX / GLOSSARY SECTIONS (after Book of Moroni)")
    [void]$sb.AppendLine(("-" * 80))
    for ($i = 15; $i -lt $structure.Count; $i++) {
        $book = $structure[$i]
        [void]$sb.AppendLine("  - $($book.Name)")
    }
}

[System.IO.File]::WriteAllText($outputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Analysis complete. Output: $outputPath"
Write-Host "Books found: $bookNum"
Write-Host "Chapter headings: $totalChapters"
