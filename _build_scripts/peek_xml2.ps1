[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$content = [System.IO.File]::ReadAllText($xmlPath, [System.Text.Encoding]::UTF8)
$xml = [xml]$content
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

# Get all paragraphs and their text
$paragraphs = $xml.SelectNodes("//w:p", $ns)
Write-Output "Total paragraphs: $($paragraphs.Count)"
Write-Output ""
Write-Output "=== First 120 paragraphs with text ==="
$count = 0
$shown = 0
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $texts) {
        $fullText += $t.InnerText
    }
    if ($fullText.Trim() -ne "") {
        Write-Output "P[$count]: $fullText"
        $shown++
        if ($shown -ge 120) { break }
    }
    $count++
}
