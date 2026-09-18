# Installs a Windows Scheduled Task that runs the Stat Desk daily at 7:00 AM
# in the machine's local time zone. Set Windows to Eastern, or adjust -At.
# Caveat: the task only fires if the computer is on (Task Scheduler can wake it if allowed in power settings).
$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$repo\statdesk\run.cmd`" >> `"$repo\statdesk\data\scheduler.log`" 2>&1"
$trigger = New-ScheduledTaskTrigger -Daily -At 7:00AM
$settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable
Register-ScheduledTask -TaskName "Nosebleed Stat Desk" -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Installed task 'Nosebleed Stat Desk' (daily 7:00 AM local). Run on demand: statdesk\run.cmd"
