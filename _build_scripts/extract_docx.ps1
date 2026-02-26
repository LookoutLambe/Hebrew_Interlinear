# Extract docx and list contents
$docxPath = 'C:\Users\chris\Desktop\Hebrew BOM\Hebrew_BOM_20_February_2026.docx'
$extractPath = 'C:\Users\chris\Desktop\Hebrew BOM\docx_extracted'

# Clean up if exists
if (Test-Path $extractPath) { Remove-Item $extractPath -Recurse -Force }

# Copy and extract
$zipPath = $extractPath + '.zip'
Copy-Item $docxPath $zipPath
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
Remove-Item $zipPath

# List contents
Get-ChildItem $extractPath -Recurse | Select-Object FullName
