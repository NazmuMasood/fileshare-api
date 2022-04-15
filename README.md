# FileShare-API

Main requirements: NodeJs.

Please do the following to run the program:
1. Please install 'NodeJs' first if you don't already have it installed

2. After pulling the project, install dependencies and run the app
```
cd project_directory
npm i
npm run start
```
Some thoughts on the ENVIRONMENT_VARIABLES located in .env 
```
DAILY_UPLOAD_LIMIT=5 // controls a particular user's highest upload limit for a day
DAILY_DOWNLOAD_LIMIT=5 // controls the highest download limit for a day
PERIOD_OF_INACTIVITY_IN_MILISECOND=86400000 // Inactive_period used in a cleanup_job to delete files that are older than this period
REDIS_DEFAULT_EXPIRATION_TIME=86400000 // Used in Rate Limiter to store a user's api_request_frequency for this time_period i.e. 24hrs 
```

