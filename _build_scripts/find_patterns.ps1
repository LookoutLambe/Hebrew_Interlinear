[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)

# Find all paragraphs that look like chapter headers or book headers
$count = 0
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $texts) {
        $fullText += $t.InnerText
    }
    $trimmed = $fullText.Trim()

    # Look for "פרק" (chapter) markers
    if ($trimmed -match '^\u05E4\u05E8\u05E7') {
        Write-Output "P[$count] CHAPTER: $trimmed"
    }
    # Look for book names (short lines that match known book names)
    elseif ($trimmed -match '^\u05E0\u05E4\u05D9 [\u05D0-\u05EA]' -or
            $trimmed -match '^\u05D9\u05E2\u05E7\u05D1$' -or
            $trimmed -match '^\u05D0\u05E0\u05D5\u05E9$' -or
            $trimmed -match '^\u05D9\u05E8\u05D5\u05DD$' -or
            $trimmed -match '^\u05E2\u05DE\u05E0\u05D9$' -or
            $trimmed -match '^\u05D3\u05D1\u05E8\u05D9 \u05DE\u05D5\u05E8\u05DE\u05D5\u05DF' -or
            $trimmed -match '^\u05DE\u05D5\u05E9\u05D9\u05D4$' -or
            $trimmed -match '^\u05D0\u05DC\u05DE\u05D0$' -or
            $trimmed -match '^\u05D4\u05D9\u05DC\u05DE\u05DF$' -or
            $trimmed -match '^\u05DE\u05D5\u05E8\u05DE\u05D5\u05DF$' -or
            $trimmed -match '^\u05D0\u05EA\u05E8$' -or
            $trimmed -match '^\u05DE\u05D5\u05E8\u05D5\u05E0\u05D9$') {
        Write-Output "P[$count] BOOK: $trimmed"
    }
    $count++
}
