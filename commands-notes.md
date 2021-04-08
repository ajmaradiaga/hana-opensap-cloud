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

## Part 5 - Cross access schema

Setup of the User Provided Service, how to create hdbgrants and finally creating synonyms to the foreign schema.

```sql
-----------
-- USER ---
-----------

-- UPS User provided service
CREATE USER CUPS_SFLIGHT PASSWORD "HANARocks01" SET PARAMETER CLIENT = '001' SET USERGROUP DEFAULT;

-- Disable changing the password of the user just created
ALTER USER CUPS_SFLIGHT DISABLE PASSWORD LIFETIME;

-- Grant option, so it can be granted to other users
GRANT SELECT ON SCHEMA SFLIGHT TO CUPS_SFLIGHT WITH GRANT OPTION;

GRANT SELECT METADATA ON SCHEMA SFLIGHT TO CUPS_SFLIGHT WITH GRANT OPTION;

-----------
-- ROLE ---
-----------

-- Creating role
CREATE ROLE SFLIGHT_CONTAINER_ACCESS;

-- Granting access
GRANT SELECT, SELECT METADATA ON SCHEMA SFLIGHT TO SFLIGHT_CONTAINER_ACCESS WITH GRANT OPTION;

-- Assign role to previously created user. ADMIN_OPTION so it can give the access to other users. Similar to GRANT_OPTION above.
GRANT SFLIGHT_CONTAINER_ACCESS TO CUPS_SFLIGHT WITH ADMIN OPTION;

-- GRANT OPTION, ADMIN OPTION -> Pass on the acces to our container technical users

```

```bash
# Create User Provider Service
cf cups CROSS_SCHEMA_SFLIGHT -p "{\"user\": \"CUPS_SFLIGHT\", \"password\": \"HANARocks01\", \"driver\": \"com.sap.db.jdbc.Driver\", \"tags\": [\"hana\"], \"schema\": \"SFLIGHT\" }"

# List services - The new CROSS_SCHEMA_FLIGHT should be listed
cf services
```

Tell our HDI container to use the UPS to perform grant to our container technical users -> create cfg folder and SFLIGHT.hdgrants.

Create synonyms to be able to access SFLIGHT -> synonyms folder in db/src/. Grant access in our HDI container to a foreign schema - SFLIGHT

```bash
# Get table in CDS format
$ hana-cli inspectTable -o cds
$ hana-cli inspectTable SFLIGHT SBOOK -o cds
```

## Part 6 - Cross container access

```bash 
# Create new HDI container
hana-cli createModule -f user_db

# Download the HDI deployer
cd user_db
npm install

# Check services
cf services

# Create HANA hdi-shared service
cf create-service hana hdi-shared hana-opensap-cloud-user-db

# Create the default service key
cf create-service-key hana-opensap-cloud-user-db default

# Download service key and store it in default-env.json
hana-cli serviceKey hana-opensap-cloud-user-db default

# Copy new components and deploy defined in user_db folder
cp -r ~/code/forks/hana-opensap-cloud-2020/user_db/src/defaults src/
cp -r ~/code/forks/hana-opensap-cloud-2020/user_db/src/models src/
cp -r ~/code/forks/hana-opensap-cloud-2020/user_db/src/procedures src/
cp -r ~/code/forks/hana-opensap-cloud-2020/user_db/src/roles src/
cp -r ~/code/forks/hana-opensap-cloud-2020/user_db/src/synonyms src/
npm start

# Grant cross container access. Changes in other project files:
# - The default-env.json included in db/. Add credentials from the user_db/default-env.json
# - mta.yaml add user_db module
# - Add the build steps in the main package.json
cd ..; cd db
cp -r ~/code/forks/hana-opensap-cloud-2020/db/cfg/user.hdb src/
cp -r ~/code/forks/hana-opensap-cloud-2020/db/cfg/user.hdbgrants cfg/
cp -r ~/code/forks/hana-opensap-cloud-2020/db/cfg/user.hdbsynonymconfig cfg/
cp -r ~/code/forks/hana-opensap-cloud-2020/db/src/synonyms/user.hdbsynonym src/synonyms/
npm start

# Validate synonyms and get cds definition of table
hana-cli inspectTable 61E06B1D28D5436BA534877EDF7CFCB5 USERDATA_USER -o cds

cds build
cds serve
```

Expose in srv/service.cds by adding the reference.

## Part 7 - Calculation views

Create calculation view in Business Application Studio - Step by step how to: [https://saphanajourney.com/hana-cloud/learning-article/how-to-create-a-calculation-view-with-sap-web-ide/](https://saphanajourney.com/hana-cloud/learning-article/how-to-create-a-calculation-view-with-sap-web-ide/)

Localised the calculation view, e.g. ./db/src/models/BUYER_de.properties and created a synonym for when the calculation view contains a namespace.

## Part 8 - SQL Script

Added scripts for functions, procedures in ./db/src folder

```bash
$ cd db
$ npm start
```

## Part 9 - Service Handler

Updated definition of service.cds to include path for implementations. Also, updated the paths to the services. Added the PO service

```bash
$ cds build
$ cd db; npm start
$ cd ..; cds serve
```
