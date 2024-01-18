import {v4 as uuidv4} from "uuid";
import sqlite3 from "sqlite3";
import fs from "fs";

// Read the schema from the file
const schemaPath = 'schema.sql';
const schema = fs.readFileSync(schemaPath, 'utf8');

export default function intitialise_demo_database(sqliteDBPath) {
  console.log("Database file missing, initialising database file with schema");
  const db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
  // Execute the schema
  db.serialize(function() {
    db.exec(schema, function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Schema executed successfully');
      }
    });
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

    db.run("INSERT INTO gives_purchase_rights (recipient_id, authoriser_id, created_at) VALUES (?, ?, ?)", [ashsId, nicksIdForRights, new Date().toISOString()]);

    db.run("INSERT INTO vulnerability () VALUES (?, ?, ?, ?, ?)", ['9dce9345-e306-4786-b7f0-536827351d21', 'Security Flaw',	'Critical',	'https://example.com', '2024-01-16 14:13:55.849160']);
    return db
  });
}
