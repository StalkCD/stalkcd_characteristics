# stalkcd_characteristics

####
This project enables the download of historical pipeline execution data of GitHub workflows via the 
GitHub API.
Additionally, workflow files can be downloaded.
It also includes the aggregation of various metrics from the historical pipeline execution data.
This readme will describe how to use the project.

### Stand-alone ##
If used without the StalkCD-Cockpit project the functionality can be accessed with the CLI.

## Installation
In the directory of this repository, run the following command:

```shell
npm install
```

Now, compile the TypeScript code to JavaScript.

```shell
./node_modules/.bin/tsc
```

Or, if you have installed typescript globally (`npm -g i typescript`), just run:

```shell
tsc
```

## Use functionality

Execute the commands in the stalk-cd.ts file by using 
```shell
./stalkcd command -option value
```
# Download
One centerpiece of this project is the download using
```shell
./stalkcd download-ghafiles-and-logs -o "repoOwner" -n "repoName" -w "workflowName" -t "GitHub-Token" -d "depth" -s "savetype" -p "pages"
```
The variable explanations can be found in the stalk-cd.ts file.
Downloading the data this way will store the data in folders, subfolders and files.

# KPIs
Another centerpiece is the aggregation of KPIs using
```shell
./stalkcd get-kpis -n "repoName" -w "workflowName" -l "load"
```
The variable explanations can be found in the stalk-cd.ts file.

### With the StalkCD-Cockpit project
Pulling the StalkCD-Cockpit project from 
[here](https://github.com/StalkCD/stalkcd_cockpit) 
enables the use of MongoDB, the running of the functionality in Docker and the use of the functionality via a user interface.
This project and the StalkCD-Cockpit project have to be in the same folder on the hard drive.

Afterward, there are two viable possibilities to use the functionality.
The docker-compose in the StalkCD-Cockpit project can be used to create all images and the containers can be started
according to the use case.

## CLI + MongoDB
Starting the Container with the MongoDB the functionality can be accessed via the CLI, but with the MongoDB running the
data can be stored there.
For the download the "savetype" = "db" and for the kpis the "load"="db" can be used.


## Cockpit + Characteristics + MongoDB
Running the cockpit, this project and MongoDB in containers, enables the use of this project from the user interface.
The user interface can be found under its respective path in a web browser.
