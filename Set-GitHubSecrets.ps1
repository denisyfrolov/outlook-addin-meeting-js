if(-Not $Env:GITHUB_ACTIONS){
    if (-Not (Get-Module -ListAvailable -Name Set-GitHubSecrets)) {
        Install-Module -Name Set-GitHubSecrets -Force -Confirm:$false
    }
    Set-GitHubSecrets -verbose
}