param(
  [string]$MobileDir = "$HOME/../Deco/Desktop/helpdesk-mobile",
  [ValidateSet("expo","rn")] [string]$MobileType = "expo",
  [switch]$RunAndroid,
  [switch]$RunIOS
)

$ErrorActionPreference = 'Stop'

function Start-Terminal {
  param(
    [string]$Title,
    [string]$Command
  )
  Start-Process -WindowStyle Normal -FilePath "powershell.exe" -ArgumentList @(
    '-NoExit',
    '-Command',
    "`$host.UI.RawUI.WindowTitle = '$Title'; Write-Host '>> $Title' -ForegroundColor Cyan; $Command"
  )
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path -Path $Path)) {
    throw "Diretório não encontrado: $Path"
  }
}

$WebDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Ensure-Dir $WebDir

try {
  Write-Host "Iniciando Web (Vite) em: $WebDir" -ForegroundColor Green
  $webCmd = "cd `"$WebDir`"; npm i; npm run dev -- --host"
  Start-Terminal -Title "HelpLine • Web" -Command $webCmd

  if ($MobileType -eq 'expo') {
    Ensure-Dir $MobileDir
    Write-Host "Iniciando Mobile (Expo) em: $MobileDir" -ForegroundColor Green
    $mobileCmd = "cd `"$MobileDir`"; npm i; npx expo start"
    Start-Terminal -Title "HelpLine • Mobile (Expo)" -Command $mobileCmd
  } elseif ($MobileType -eq 'rn') {
    Ensure-Dir $MobileDir
    Write-Host "Iniciando Mobile (React Native) em: $MobileDir" -ForegroundColor Green
    $metroCmd = "cd `"$MobileDir`"; npm i; npx react-native start"
    Start-Terminal -Title "HelpLine • Mobile (Metro)" -Command $metroCmd
    if ($RunAndroid) {
      $androidCmd = "cd `"$MobileDir`"; npx react-native run-android"
      Start-Terminal -Title "HelpLine • Android" -Command $androidCmd
    }
    if ($RunIOS) {
      $iosCmd = "cd `"$MobileDir`"; npx react-native run-ios"
      Start-Terminal -Title "HelpLine • iOS" -Command $iosCmd
    }
  }

  Write-Host "Tudo pronto! Feche este terminal se desejar. As janelas abertas rodam Web e Mobile." -ForegroundColor Yellow
  Write-Host "Dica: Altere o caminho com -MobileDir e o tipo com -MobileType expo|rn" -ForegroundColor Yellow
}
catch {
  Write-Error $_
  exit 1
}

