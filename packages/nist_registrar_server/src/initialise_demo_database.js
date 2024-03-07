import {v4 as uuidv4} from "uuid";
import sqlite3 from "sqlite3";
import fs from "fs";

function loadFile(filepath) {
  try {
    // Read the JSON file synchronously
    const data = fs.readFileSync(filepath, 'utf8');
    // Parse the JSON data
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing JSON:', error);
    return null;
  }
}

const internalTrafficMud = loadFile('./src/example_mud_files/internal_traffic_mud.json');
const externalTrafficMud = loadFile('./src/example_mud_files/external_traffic_mud.json');
const internalAndExternalTrafficMud = loadFile('./src/example_mud_files/internal_and_external_traffic_mud.json');

console.log(internalTrafficMud, externalTrafficMud, internalAndExternalTrafficMud)

const demoVulnerabilityId = '9dce9345-e306-4786-b7f0-536827351d21';

// Read the schema from the file
const schemaPath = 'schema.sql';
const schema = fs.readFileSync(schemaPath, 'utf8');

export default function intitialiseDemoDatabase(sqliteDBPath) {
  try {
    console.log("Database file missing, initialising database file with schema");
    const db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
    // Execute the schema
    db.serialize(function() {
      db.exec(schema);
      console.log('Schema executed successfully');
      // List of usernames
      const usernames = ['Ash', 'John', 'Ant', 'James', 'Ionut', 'Nick', 'Anita', 'Hannah', 'Suzanne', 'Alois', 'Alex', 'Toby'];

      // Insert data into user table with UUID for each user
      for (const username of usernames) {
        db.run("INSERT INTO user (id, username, created_at) VALUES (?, ?, ?)", [uuidv4(), username, new Date().toISOString()]);
      }

      // Update users 'Nick' and 'John' to have can_issue_purchase_rights and can_issue_connection_rights
      db.run("UPDATE user SET can_issue_purchase_rights = TRUE, can_issue_connection_rights = TRUE WHERE username IN ('Nick', 'John')");

      // Update users to have can_issue_trust
      db.run("UPDATE user SET can_issue_trust = TRUE WHERE username IN ('Nick', 'Ash', 'Ant', 'James', 'Ionut')");

      // Insert data into trusts table - Nick Trusts Amazon
      const nickRow = db.get("SELECT id FROM user WHERE username = 'Nick'");
      const nicksId = nickRow.id;

      // Insert data into allow_to_connect - John allows Ash's Amazon Echo to connect
      const johnRow = db.get("SELECT id FROM user WHERE username = 'John'");
      const johnsId = johnRow.id;

      // Insert a single entry into gives_purchase_rights
      const ashRow = db.get("SELECT id FROM user WHERE username = 'Ash'");
      const ashsId = ashRow.id;

      const nickRowForRights = db.get("SELECT id FROM user WHERE username = 'Nick'");
      const nicksIdForRights = nickRowForRights.id;

      db.run("INSERT INTO manufacturer (id, name, created_at) VALUES (?, ?, ?)", ['64d45e19-8ae6-4419-9f35-39a778b9ec7c',	'www.manufacturer.com',	'2024-01-16T14:10:28.591Z']);

      db.run("INSERT INTO gives_purchase_rights (recipient_id, authoriser_id, created_at) VALUES (?, ?, ?)", [ashsId, nicksIdForRights, new Date().toISOString()]);

      db.run("INSERT INTO device_type (id, name, created_at) VALUES (?, ?, ?)", ['ac115a2d-4c18-4de4-9b59-4861ddb18b4e', 'Raspberry Pi', '2024-01-18 09:18:55.849129']);

      db.run("INSERT INTO device_type (id, name, created_at) VALUES (?, ?, ?)", ['465df82c-d250-49c1-be27-95c8e4759fc2', 'Smart Speaker', '2024-01-16 14:13:55.849129']);

      db.run("INSERT INTO mud (id, name, mud) VALUES (?, ?, ?)", [uuidv4(), 'internal traffic only', JSON.stringify(internalTrafficMud)]);

      db.run("INSERT INTO mud (id, name, mud) VALUES (?, ?, ?)", [uuidv4(), 'external traffic only', JSON.stringify(externalTrafficMud)]);

      db.run("INSERT INTO mud (id, name, mud) VALUES (?, ?, ?)", [uuidv4(), 'internal and external traffic', JSON.stringify(internalAndExternalTrafficMud)]);
    });
    return db;
  } catch (err) {
    throw err;
    return err;
  }
}
