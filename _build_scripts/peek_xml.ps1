# Read the document.xml and extract all text runs to understand structure
$xmlPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted\word\document.xml'
$xml = [xml](Get-Content $xmlPath -Encoding UTF8)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

# Get all paragraphs and their text
$paragraphs = $xml.SelectNodes("//w:p", $ns)
Write-Host "Total paragraphs: $($paragraphs.Count)"
Write-Host ""
Write-Host "=== First 100 paragraphs ==="
$count = 0
foreach ($p in $paragraphs) {
    if ($count -ge 100) { break }
    $texts = $p.SelectNodes(".//w:t", $ns)
    $fullText = ""
    foreach ($t in $texts) {
        $fullText += $t.InnerText
    }
    if ($fullText.Trim() -ne "") {
        Write-Host "P[$count]: $fullText"
    }
    $count++
}
