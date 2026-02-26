# Final comprehensive extraction script for Hebrew Book of Mormon .docx
# Outputs a detailed mapping of Hebrew book names to English equivalents with chapter counts

$xmlPath = "$env:TEMP\docx_extract\word\document.xml"
$outputPath = "C:\Users\chris\Desktop\Hebrew BOM\document_structure_final.txt"

[xml]$doc = Get-Content $xmlPath -Encoding UTF8
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $doc.SelectNodes("//w:p", $ns)

# Hebrew to English mapping for Book of Mormon books
$hebrewToEnglish = [ordered]@{
    "נפי א׳"         = "1 Nephi"
    "נפי ב׳"         = "2 Nephi"
    "יעקב"           = "Jacob"
    "אנוש"           = "Enos"
    "ירום"           = "Jarom"
    "עמני"           = "Omni"
    "דברי מורמון"     = "Words of Mormon"
    "מושיה"          = "Mosiah"
    "אלמא"           = "Alma"
    "הילמן"          = "Helaman"
    "נפי ג׳"         = "3 Nephi"
    "נפי ד׳"         = "4 Nephi"
    "מורמון"          = "Mormon"
    "אתר"            = "Ether"
    "מורוני"          = "Moroni"
}

# Hebrew number mapping
$hebrewNumbers = @{
    "א" = 1; "ב" = 2; "ג" = 3; "ד" = 4; "ה" = 5;
    "ו" = 6; "ז" = 7; "ח" = 8; "ט" = 9; "י" = 10;
    "יא" = 11; "יב" = 12; "יג" = 13; "יד" = 14; "טו" = 15;
    "טז" = 16; "יז" = 17; "יח" = 18; "יט" = 19; "כ" = 20;
    "כא" = 21; "כב" = 22; "כג" = 23; "כד" = 24; "כה" = 25;
    "כו" = 26; "כז" = 27; "כח" = 28; "כט" = 29; "ל" = 30;
    "לא" = 31; "לב" = 32; "לג" = 33; "לד" = 34; "לה" = 35;
    "לו" = 36; "לז" = 37; "לח" = 38; "לט" = 39; "מ" = 40;
    "מא" = 41; "מב" = 42; "מג" = 43; "מד" = 44; "מה" = 45;
    "מו" = 46; "מז" = 47; "מח" = 48; "מט" = 49; "נ" = 50;
    "נא" = 51; "נב" = 52; "נג" = 53; "נד" = 54; "נה" = 55;
    "נו" = 56; "נז" = 57; "נח" = 58; "נט" = 59; "ס" = 60;
    "סא" = 61; "סב" = 62; "סג" = 63
}

# Reverse lookup: number to Hebrew
$numberToHebrew = @{}
foreach ($kv in $hebrewNumbers.GetEnumerator()) {
    $numberToHebrew[$kv.Value] = $kv.Key
}

# Parse all headings and build structure
$currentBook = $null
$currentBookEnglish = $null
$bookStructure = [ordered]@{}
$allHeadings = [System.Collections.ArrayList]::new()
$glossaryHeadings = [System.Collections.ArrayList]::new()
$tocEntries = [System.Collections.ArrayList]::new()

foreach ($para in $paragraphs) {
    $styleNode = $para.SelectSingleNode("w:pPr/w:pStyle", $ns)
    $style = if ($styleNode) { $styleNode.GetAttribute("val", "http://schemas.openxmlformats.org/wordprocessingml/2006/main") } else { "Normal" }

    $textNodes = $para.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $textNodes) { $fullText += $t.InnerText }
    $fullText = $fullText.Trim()
    if ($fullText -eq "") { continue }

    # TOC entries
    if ($style -match "^TOC") {
        [void]$tocEntries.Add($fullText)
        continue
    }

    # Heading1 = Book name
    if ($style -eq "Heading1") {
        # Check if it's a BOM book name (Hebrew)
        $foundBook = $null
        foreach ($kv in $hebrewToEnglish.GetEnumerator()) {
            if ($fullText -eq $kv.Key) {
                $foundBook = $kv.Value
                break
            }
        }
        if ($foundBook) {
            $currentBook = $fullText
            $currentBookEnglish = $foundBook
            if (-not $bookStructure.Contains($foundBook)) {
                $bookStructure[$foundBook] = [System.Collections.ArrayList]::new()
            }
        } else {
            # English glossary heading or other
            $currentBook = $null
            $currentBookEnglish = $null
            [void]$glossaryHeadings.Add($fullText)
        }
        [void]$allHeadings.Add("BOOK: $fullText")
    }

    # Heading2 = Chapter (פרק X)
    if ($style -eq "Heading2" -and $currentBookEnglish) {
        # Extract chapter number from Hebrew
        if ($fullText -match "^פרק\s+(.+)$") {
            $hebrewNum = $Matches[1].Trim()
            $chapterNum = $hebrewNumbers[$hebrewNum]
            if ($chapterNum) {
                [void]$bookStructure[$currentBookEnglish].Add($chapterNum)
            } else {
                [void]$bookStructure[$currentBookEnglish].Add("? ($hebrewNum)")
            }
        }
        [void]$allHeadings.Add("  CHAPTER: $fullText")
    }
}

# Expected chapter counts for Book of Mormon
$expectedChapters = [ordered]@{
    "1 Nephi" = 22
    "2 Nephi" = 33
    "Jacob" = 7
    "Enos" = 1
    "Jarom" = 1
    "Omni" = 1
    "Words of Mormon" = 1
    "Mosiah" = 29
    "Alma" = 63
    "Helaman" = 16
    "3 Nephi" = 30
    "4 Nephi" = 1
    "Mormon" = 9
    "Ether" = 15
    "Moroni" = 10
}

# Build output
$sb = [System.Text.StringBuilder]::new()

[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("HEBREW BOOK OF MORMON - COMPLETE DOCUMENT STRUCTURE ANALYSIS")
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("File: Hebrew_BOM_20_February_2026.docx")
[void]$sb.AppendLine("Analysis Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("Total paragraphs: $($paragraphs.Count)")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("TABLE OF CONTENTS (from document TOC entries)")
[void]$sb.AppendLine("-" * 80)
foreach ($toc in $tocEntries) {
    [void]$sb.AppendLine("  $toc")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("BOOKS AND CHAPTERS - DETAILED BREAKDOWN")
[void]$sb.AppendLine("-" * 80)
[void]$sb.AppendLine("")

$totalChaptersFound = 0
$totalChaptersExpected = 0
$bookNumber = 0

foreach ($kv in $hebrewToEnglish.GetEnumerator()) {
    $bookNumber++
    $english = $kv.Value
    $hebrew = $kv.Key
    $expected = $expectedChapters[$english]
    $totalChaptersExpected += $expected

    if ($bookStructure.Contains($english)) {
        $chapters = $bookStructure[$english]
        $chapCount = $chapters.Count
        $totalChaptersFound += $chapCount

        # For single-chapter books (Enos, Jarom, Omni, Words of Mormon, 4 Nephi),
        # they have no Heading2 chapter markers - the book IS the chapter
        if ($expected -eq 1 -and $chapCount -eq 0) {
            $chapCount = 1
            $totalChaptersFound += 1
            $status = "OK (single-chapter book, no separate chapter heading)"
        } elseif ($chapCount -eq $expected) {
            $status = "OK - COMPLETE"
        } else {
            # Find missing chapters
            $missingChapters = @()
            for ($i = 1; $i -le $expected; $i++) {
                if ($chapters -notcontains $i) {
                    $missingChapters += $i
                }
            }
            if ($missingChapters.Count -gt 0) {
                $status = "INCOMPLETE - Missing chapters: $($missingChapters -join ', ')"
            } else {
                $status = "OK ($chapCount chapters)"
            }
        }

        $chapterList = if ($chapters.Count -gt 0) { ($chapters | Sort-Object) -join ", " } else { "(no separate chapter headings)" }

        [void]$sb.AppendLine("$bookNumber. $english ($hebrew)")
        [void]$sb.AppendLine("   Expected chapters: $expected")
        [void]$sb.AppendLine("   Found chapters: $chapCount")
        [void]$sb.AppendLine("   Chapter numbers: $chapterList")
        [void]$sb.AppendLine("   Status: $status")
        [void]$sb.AppendLine("")
    } else {
        [void]$sb.AppendLine("$bookNumber. $english ($hebrew)")
        [void]$sb.AppendLine("   *** BOOK NOT FOUND IN DOCUMENT ***")
        [void]$sb.AppendLine("")
    }
}

[void]$sb.AppendLine("-" * 80)
[void]$sb.AppendLine("TOTAL: $totalChaptersFound chapters found across all books")
[void]$sb.AppendLine("EXPECTED: $totalChaptersExpected chapters (standard Book of Mormon)")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("APPENDIX / GLOSSARY SECTIONS (English Heading1 entries)")
[void]$sb.AppendLine("-" * 80)
foreach ($gh in $glossaryHeadings) {
    [void]$sb.AppendLine("  - $gh")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("HEBREW-ENGLISH BOOK NAME MAPPING")
[void]$sb.AppendLine("-" * 80)
[void]$sb.AppendLine(("{0,-20} {1,-25}" -f "Hebrew", "English"))
[void]$sb.AppendLine(("{0,-20} {1,-25}" -f "------", "-------"))
foreach ($kv in $hebrewToEnglish.GetEnumerator()) {
    [void]$sb.AppendLine(("{0,-20} {1,-25}" -f $kv.Key, $kv.Value))
}

[System.IO.File]::WriteAllText($outputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Final analysis written to: $outputPath"
