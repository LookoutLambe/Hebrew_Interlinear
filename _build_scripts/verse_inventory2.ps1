# -*- coding: utf-8 -*-
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)

# Hebrew numeral values by Unicode codepoint
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

# Build book names using Unicode escapes to avoid encoding issues
# Book Hebrew names constructed from chars
$bk_1nephi = [char]0x05E0 + [string][char]0x05E4 + [char]0x05D9 + " " + [char]0x05D0 + [char]0x05F3
$bk_2nephi = [char]0x05E0 + [string][char]0x05E4 + [char]0x05D9 + " " + [char]0x05D1 + [char]0x05F3
$bk_jacob = [char]0x05D9 + [string][char]0x05E2 + [char]0x05E7 + [char]0x05D1
$bk_enos = [char]0x05D0 + [string][char]0x05E0 + [char]0x05D5 + [char]0x05E9
$bk_jarom = [char]0x05D9 + [string][char]0x05E8 + [char]0x05D5 + [char]0x05DD
$bk_omni = [char]0x05E2 + [string][char]0x05DE + [char]0x05E0 + [char]0x05D9
$bk_wom = [char]0x05D3 + [string][char]0x05D1 + [char]0x05E8 + [char]0x05D9 + " " + [char]0x05DE + [char]0x05D5 + [char]0x05E8 + [char]0x05DE + [char]0x05D5 + [char]0x05DF
$bk_mosiah = [char]0x05DE + [string][char]0x05D5 + [char]0x05E9 + [char]0x05D9 + [char]0x05D4
$bk_alma = [char]0x05D0 + [string][char]0x05DC + [char]0x05DE + [char]0x05D0
$bk_helaman = [char]0x05D4 + [string][char]0x05D9 + [char]0x05DC + [char]0x05DE + [char]0x05DF
$bk_3nephi = [char]0x05E0 + [string][char]0x05E4 + [char]0x05D9 + " " + [char]0x05D2 + [char]0x05F3
$bk_4nephi = [char]0x05E0 + [string][char]0x05E4 + [char]0x05D9 + " " + [char]0x05D3 + [char]0x05F3
$bk_mormon = [char]0x05DE + [string][char]0x05D5 + [char]0x05E8 + [char]0x05DE + [char]0x05D5 + [char]0x05DF
$bk_ether = [char]0x05D0 + [string][char]0x05EA + [char]0x05E8
$bk_moroni = [char]0x05DE + [string][char]0x05D5 + [char]0x05E8 + [char]0x05D5 + [char]0x05E0 + [char]0x05D9

$bookNamesHeb = @($bk_1nephi, $bk_2nephi, $bk_jacob, $bk_enos, $bk_jarom, $bk_omni, $bk_wom, $bk_mosiah, $bk_alma, $bk_helaman, $bk_3nephi, $bk_4nephi, $bk_mormon, $bk_ether, $bk_moroni)
$bookNamesEng = @('1 Nephi', '2 Nephi', 'Jacob', 'Enos', 'Jarom', 'Omni', 'Words of Mormon', 'Mosiah', 'Alma', 'Helaman', '3 Nephi', '4 Nephi', 'Mormon', 'Ether', 'Moroni')
$expectedChapters = @(22, 33, 7, 1, 1, 1, 1, 29, 63, 16, 30, 1, 9, 15, 10)

# Single-chapter book indices
$singleChapterIndices = @(3, 4, 5, 6, 11)  # Enos, Jarom, Omni, WoM, 4 Nephi

# Chapter marker prefix
$perekPrefix = [char]0x05E4 + [string][char]0x05E8 + [char]0x05E7

# Collect all paragraph text
$allParas = New-Object System.Collections.ArrayList
$idx = 0
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $texts) {
        $fullText += $t.InnerText
    }
    [void]$allParas.Add(@{ Index = $idx; Text = $fullText.Trim() })
    $idx++
}

Write-Output "Total paragraphs in document: $($allParas.Count)"
Write-Output ""

# Results dictionary: key = "bookIndex_chapter", value = verse count
$results = @{}
$currentBookIdx = -1
$currentChapter = 0
$pastTOC = $false

foreach ($para in $allParas) {
    $text = $para.Text
    $pIdx = $para.Index

    if ($text -eq "") { continue }

    # Skip everything before the actual content starts
    if (-not $pastTOC) {
        if ($pIdx -ge 140 -and $text -eq $bk_1nephi) {
            $pastTOC = $true
        } else {
            continue
        }
    }

    # Check for book headers
    $foundBook = $false
    for ($i = 0; $i -lt $bookNamesHeb.Count; $i++) {
        if ($text -eq $bookNamesHeb[$i]) {
            $currentBookIdx = $i
            if ($singleChapterIndices -contains $i) {
                $currentChapter = 1
                $key = "${i}_1"
                if (-not $results.ContainsKey($key)) {
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

    # Check for chapter headers
    if ($text.StartsWith($perekPrefix)) {
        $rest = $text.Substring($perekPrefix.Length).Trim()
        $chapterNum = ConvertFrom-HebrewNumeral $rest
        if ($chapterNum -gt 0) {
            $currentChapter = $chapterNum
            $key = "${currentBookIdx}_${currentChapter}"
            if (-not $results.ContainsKey($key)) {
                $results[$key] = 0
            }
        }
        continue
    }

    # Check for verse markers
    if ($currentBookIdx -ge 0 -and $currentChapter -gt 0) {
        # Match Hebrew letter(s) followed by period and space
        if ($text -match '^([\u05D0-\u05EA]+)\.\s') {
            $verseNumStr = $Matches[1]
            $verseNum = ConvertFrom-HebrewNumeral $verseNumStr
            if ($verseNum -gt 0) {
                $key = "${currentBookIdx}_${currentChapter}"
                if ($results.ContainsKey($key)) {
                    $results[$key]++
                } else {
                    $results[$key] = 1
                }
            }
        }
    }
}

# Output results
Write-Output "============================================="
Write-Output "  COMPLETE VERSE INVENTORY"
Write-Output "  Hebrew Book of Mormon"
Write-Output "============================================="
Write-Output ""

$grandTotal = 0
for ($b = 0; $b -lt $bookNamesEng.Count; $b++) {
    $eng = $bookNamesEng[$b]
    $heb = $bookNamesHeb[$b]
    $expCh = $expectedChapters[$b]
    $bookTotal = 0
    $chaptersFound = 0

    Write-Output "---------------------------------------------"
    Write-Output "  $eng ($heb) - Expected: $expCh chapters"
    Write-Output "---------------------------------------------"

    for ($ch = 1; $ch -le 200; $ch++) {
        $key = "${b}_${ch}"
        if ($results.ContainsKey($key)) {
            $count = $results[$key]
            $bookTotal += $count
            $chaptersFound++
            Write-Output ("  Chapter {0,3}: {1,3} verses" -f $ch, $count)
        }
    }

    Write-Output ""
    Write-Output "  TOTAL: $chaptersFound chapters, $bookTotal verses"
    Write-Output ""
    $grandTotal += $bookTotal
}

Write-Output "============================================="
Write-Output "  GRAND TOTAL: $grandTotal verses"
Write-Output "============================================="
