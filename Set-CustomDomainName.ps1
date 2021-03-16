if(-Not $Env:GITHUB_ACTIONS){
    if (-Not (Get-Module -ListAvailable -Name Set-PsEnv)) {
        Install-Module -Name Set-PsEnv -Force -Confirm:$false
    }
    $Global:PreviousDir = $null
    Set-PsEnv
}

$ASWA_DEFAULTHOSTNAME=$(az staticwebapp browse --name $Env:ASWA_NAME --query defaultHostname) -replace '"', ""

az network dns record-set cname set-record --resource-group $Env:ZONE_RESOURCEGROUP --zone-name $Env:ZONE_NAME --record-set-name $Env:ZONE_RECORDSETNAME --cname "$ASWA_DEFAULTHOSTNAME." --output none
az network dns record-set cname set-record --resource-group $Env:ZONE_RESOURCEGROUP --zone-name $Env:ZONE_NAME --record-set-name "www.$Env:ZONE_RECORDSETNAME" --cname "$ASWA_DEFAULTHOSTNAME." --output none
az staticwebapp hostname set --name $Env:ASWA_NAME --hostname "$Env:ZONE_RECORDSETNAME.$Env:ZONE_NAME"