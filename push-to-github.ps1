# Upload POINPY-LevelUP to GitHub (drdavid7)
# Run once:  gh auth login
# Then run:  .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Ensure GitHub CLI is logged in
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to GitHub. Starting login..." -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web
}

# Create repo if it doesn't exist, then push
$repo = "drdavid7/POINPY-LevelUP"
$exists = gh repo view $repo 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating repository $repo ..." -ForegroundColor Cyan
    gh repo create $repo --public --source=. --remote=origin --description "POINPY-style HTML5 bounce-climber (Phaser 3 + Capacitor)"
}

git push -u origin main
Write-Host "Done! https://github.com/$repo" -ForegroundColor Green
