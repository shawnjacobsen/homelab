# linux-automation
A directory of scripts to be continuously run on an on-prem linux server to automate various processes.
</br>
</br>
## Canvas Automation
Pulls course and assignments information and adds this data as pages in Notion as a database

**TO DO**
- [x] Pull new assignments and add them to notion for the curent semester
- [x] Abstract all canvas and notion queries for use with other automations
- [ ] Update existing assignments in Notion if any properties have changed

## Recurring Notion Tasks
Programmatically uploads specified recurring tasks based on the day of the week to a Notion Database

- [x] Use the Notion API to add pages to a database
- [x] Use a JSON file to specify tasks and which days of the week they should be added to the Notion DB
- [x] Automatic error notifications served to SMS via a local smtp server
- [ ] Deploy to production and create a recurring cronjob to automate script
