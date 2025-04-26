# linux-automation
A directory of scripts to be continuously run on an on-prem linux server to automate various processes.</br>

[Homelab Setup and Information](https://tranquil-coyote-ee7.notion.site/Home-Lab-Architecture-v2-0-1e16f65623108162b7c6cb64fe7c54df)

</br>
</br>
## Canvas Automation
Pulls course and assignment information and adds this data as pages to a specified Notion database

**TO DO**
- [x] Pull new assignments and add them to notion for the curent semester
- [x] Abstract all canvas and notion queries for use with other automations
- [x] Update existing assignments in Notion if any properties have changed

## Recurring Notion Tasks
Programmatically uploads specified recurring tasks based on the day of the week to a Notion Database

- [x] Use the Notion API to add pages to a database
- [x] Use a JSON file to specify tasks and which days of the week they should be added to the Notion DB
- [x] Automatic error notifications served to SMS via a local smtp server
- [x] Deploy to production and create a recurring cronjob to automate script
