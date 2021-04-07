# Commands

Capturing all the commands used in the video series by Thomas Jung - https://www.youtube.com/watch?v=t3nIXxibmso&list=PL6RpkC85SLQDjdUsv1ENsBG43PorsSmbS&index=56

## Part 1 - Project setup and first DB build


```bash
npm init hana-opensap-cloud --add mta,hana,pipeline

npm install

# Normal gen folder
cds build

# Install hana client
npm install -g hana-cli

# Create the package.json and .build.js in db folder
hana-cli createModule

# Add build structure in cds - main package.json 
# https://www.youtube.com/watch?v=t3nIXxibmso&list=PL6RpkC85SLQDjdUsv1ENsBG43PorsSmbS&index=55&t=1096s
vim package.json

# Generate /gen folder in srv and db
cds build

# Create service
cf create-service hana hdi-shared hana-opensap-cloud-db

# Create service key to connect to container
cf create-service-key hana-opensap-cloud-db default

# Associate service key to hana-cli - creates default-env.json
hana-cli serviceKey hana-opensap-cloud-db default

# Modify package.json to add env copy
vim package.json # scripts
npm run env

# Validate that is working
cd db
hana-cli status
hana-cli systemInfo

# From the db folder - deploy
npm install
npm start # Deploys to container

# Open the database explorer
hana-cli opendbx
```

## Part 2 - Designing the data model

No new commands introduced. Mostly updating the ./db/schema/common.cds and adding data in ./db/csv

```bash
cds build

# Navigate to ./db
cd db

# Deploy to HANA Cloud
npm start
```

## Part 3 & 4 - Building the data model

No new commands introduced. Mostly updating the ./db/schema/ and including native HANA objects in ./db/src -> constraints, data, indexes

```bash
cds build

# Navigate to ./db
cd db

# Deploy to HANA Cloud
npm start
```
