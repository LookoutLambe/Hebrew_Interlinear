[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)

# Hebrew numeral conversion map
# Single letters
$hebrewNumerals = @{
    [char]0x05D0 = 1   # alef
    [char]0x05D1 = 2   # bet
    [char]0x05D2 = 3   # gimel
    [char]0x05D3 = 4   # dalet
    [char]0x05D4 = 5   # he
    [char]0x05D5 = 6   # vav
    [char]0x05D6 = 7   # zayin
    [char]0x05D7 = 8   # chet
    [char]0x05D8 = 9   # tet
    [char]0x05D9 = 10  # yod
    [char]0x05DA = 20  # kaf sofit
    [char]0x05DB = 20  # kaf
    [char]0x05DC = 30  # lamed
    [char]0x05DD = 40  # mem sofit
    [char]0x05DE = 40  # mem
    [char]0x05DF = 50  # nun sofit
    [char]0x05E0 = 50  # nun
    [char]0x05E1 = 60  # samekh
    [char]0x05E2 = 70  # ayin
    [char]0x05E3 = 80  # pe sofit
    [char]0x05E4 = 80  # pe
    [char]0x05E5 = 90  # tsade sofit
    [char]0x05E6 = 90  # tsade
    [char]0x05E7 = 100 # qof
    [char]0x05E8 = 200 # resh
    [char]0x05E9 = 300 # shin
    [char]0x05EA = 400 # tav
}

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

# Book names to detect (in the order they appear)
$bookNames = @(
    'נפי א׳',
    'נפי ב׳',
    'יעקב',
    'אנוש',
    'ירום',
    'עמני',
    'דברי מורמון',
    'מושיה',
    'אלמא',
    'הילמן',
    'נפי ג׳',
    'נפי ד׳',
    'מורמון',
    'אתר',
    'מורוני'
)

$bookNamesEnglish = @(
    '1 Nephi',
    '2 Nephi',
    'Jacob',
    'Enos',
    'Jarom',
    'Omni',
    'Words of Mormon',
    'Mosiah',
    'Alma',
    'Helaman',
    '3 Nephi',
    '4 Nephi',
    'Mormon',
    'Ether',
    'Moroni'
)

# Expected chapters per book
$expectedChapters = @(22, 33, 7, 1, 1, 1, 1, 29, 63, 16, 30, 1, 9, 15, 10)

# Single-chapter books
$singleChapterBooks = @('אנוש', 'ירום', 'עמני', 'דברי מורמון', 'נפי ד׳')

# Collect all paragraph text
$allParas = @()
$idx = 0
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $texts) {
        $fullText += $t.InnerText
    }
    $allParas += @{ Index = $idx; Text = $fullText.Trim() }
    $idx++
}

Write-Output "Total paragraphs in document: $($allParas.Count)"
Write-Output ""

# State tracking
$currentBook = ""
$currentBookEng = ""
$currentChapter = 0
$bookIndex = -1
$results = [ordered]@{}
$grandTotal = 0

# We need to skip the table of contents area. Real books start after the TOC.
# Based on analysis, the TOC entries are at P[125]-P[139], and the first real book starts at P[143]
$startParsing = $false
$pastTOC = $false

foreach ($para in $allParas) {
    $text = $para.Text
    $pIdx = $para.Index

    if ($text -eq "") { continue }

    # Skip everything before the actual content starts (after TOC/intro)
    # The first real book header is "נפי א׳" at around P[143]
    if (-not $pastTOC) {
        # Check if this is the first real book header (not in TOC)
        # TOC entries have page numbers appended (e.g., "נפי א׳א" at P[125])
        # Real headers are clean book names
        if ($pIdx -ge 140 -and $text -eq 'נפי א׳') {
            $pastTOC = $true
            # Fall through to process this as a book header
        } else {
            continue
        }
    }

    # Check for book headers
    $foundBook = $false
    for ($i = 0; $i -lt $bookNames.Count; $i++) {
        if ($text -eq $bookNames[$i]) {
            $currentBook = $bookNames[$i]
            $currentBookEng = $bookNamesEnglish[$i]
            $bookIndex = $i

            # For single-chapter books, start counting as chapter 1 immediately
            if ($singleChapterBooks -contains $currentBook) {
                $currentChapter = 1
                $key = "$currentBookEng|1"
                if (-not $results.Contains($key)) {
                    $results[$key] = 0
                }
            } else {
                $currentChapter = 0
            }
            $foundBook = $true
            break
        }
    }
    if ($foundBook) { continue }

    # Check for chapter headers: "פרק" followed by Hebrew numeral(s)
    if ($text -match '^\u05E4\u05E8\u05E7\s+(.+)$') {
        $chapterNumStr = $Matches[1].Trim()
        $chapterNum = ConvertFrom-HebrewNumeral $chapterNumStr
        if ($chapterNum -gt 0) {
            $currentChapter = $chapterNum
            $key = "$currentBookEng|$currentChapter"
            if (-not $results.Contains($key)) {
                $results[$key] = 0
            }
        }
        continue
    }

    # Check for verse markers: Hebrew letter(s) followed by period at start of paragraph
    # Pattern: one or more Hebrew letters, then "." then space then text
    if ($currentBook -ne "" -and $currentChapter -gt 0) {
        if ($text -match '^([\u05D0-\u05EA]+)\.\s') {
            $verseNumStr = $Matches[1]
            $verseNum = ConvertFrom-HebrewNumeral $verseNumStr
            if ($verseNum -gt 0) {
                $key = "$currentBookEng|$currentChapter"
                if ($results.Contains($key)) {
                    $results[$key]++
                } else {
                    $results[$key] = 1
                }
            }
        }
    }
}

# Now output results organized by book
Write-Output "============================================="
Write-Output "  COMPLETE VERSE INVENTORY"
Write-Output "  Hebrew Book of Mormon"
Write-Output "============================================="
Write-Output ""

$grandTotal = 0
for ($b = 0; $b -lt $bookNamesEnglish.Count; $b++) {
    $eng = $bookNamesEnglish[$b]
    $heb = $bookNames[$b]
    $expCh = $expectedChapters[$b]
    $bookTotal = 0

    Write-Output "---------------------------------------------"
    Write-Output "  $eng ($heb) - Expected: $expCh chapters"
    Write-Output "---------------------------------------------"

    for ($ch = 1; $ch -le 200; $ch++) {
        $key = "$eng|$ch"
        if ($results.Contains($key)) {
            $count = $results[$key]
            $bookTotal += $count
            Write-Output ("  Chapter {0,3}: {1,3} verses" -f $ch, $count)
        }
    }

    $chaptersFound = 0
    for ($ch = 1; $ch -le 200; $ch++) {
        $key = "$eng|$ch"
        if ($results.Contains($key)) { $chaptersFound++ }
    }

    Write-Output ""
    Write-Output "  TOTAL: $chaptersFound chapters, $bookTotal verses"
    Write-Output ""
    $grandTotal += $bookTotal
}

Write-Output "============================================="
Write-Output "  GRAND TOTAL: $grandTotal verses"
Write-Output "============================================="
