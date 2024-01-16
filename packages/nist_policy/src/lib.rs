use openssl::x509::{X509, X509Name};
use openssl::string::OpensslString;
use rusqlite::{params, Connection, Error, Result, OpenFlags};
use std::env;
use std::process;
use serde::{Serialize, Deserialize};
use serde_json::{Value, Map, to_value};
use chrono::prelude::DateTime;
use chrono::Utc;
use uuid::Uuid;
#[derive(Debug, Serialize, Deserialize)]
struct Manufacturer {
    id: String,
    name: String,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: String,
    username: String,
    role: Option<String>,
    created_at: String,
    can_issue_purchase_rights: bool,
    can_issue_connection_rights: bool,
    can_issue_trust: bool,
}

pub fn check_manufacturer_trusted(iDeVID: X509, pathToSqlDB: String) -> Result<bool> {
    // Create OpenFlags without SQLITE_OPEN_CREATE flag
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
    
    // Connect to SqlDB database from a file
    let conn = Connection::open_with_flags(pathToSqlDB, flags)?;

    // extract manufacturer from iDeVID - Issuer
    // Get the issuer name
    let issuer_name = iDeVID.issuer_name();
    // Convert the issuer name to a human-readable string
    let issuer_name_str = issuer_name
        .entries_by_nid(openssl::nid::Nid::COMMONNAME)
        .next()
        .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
        .unwrap_or_else(|| "Unknown Issuer".to_string());

    println!("Issuer: {}", issuer_name_str);
    let manufacturer_id = issuer_name_str.to_owned();
    let manufacturer_name = issuer_name_str.to_owned();

    // Check manufacturer in database, If manufacturer not present in database, add them to database, so that a user may choose to trust them or not, at a later stage
    let mut get_manufacturer_statement = conn.prepare("SELECT * FROM manufacturer WHERE (manufacturer.id = ? OR manufacturer.name = ?)")?;
    let manufacturer_record: Value = match get_manufacturer_statement.query_row(params![manufacturer_id.to_owned(), manufacturer_name.to_owned()], |row| {
        Ok(Manufacturer {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    }) {
        Ok(manufacturer) => {
            println!("Manufacturer found in database: {:?}", manufacturer);
            to_value(&manufacturer).unwrap()
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            println!("No matching manufacturer found in database");

            // Your existing code for adding the manufacturer to the database...
            let now = Utc::now();
            let datetime = DateTime::<Utc>::from(now);
            let timestamp_str = datetime.format("%Y-%m-%dT%H:%M:%S.%3fZ").to_string();
            println!("timestamp: {}", timestamp_str);

            let uuid = Uuid::new_v4();
            let manufacturer_entry = Manufacturer {
                id: if manufacturer_id.to_owned() != "null" {manufacturer_id.to_owned()} else {uuid.to_string()},
                name: manufacturer_name.to_owned(),
                created_at: timestamp_str.to_owned(),
            };

            conn.execute(
                "INSERT INTO manufacturer (id, name, created_at) VALUES (?, ?, ?)",
                params![manufacturer_entry.id, manufacturer_entry.name, manufacturer_entry.created_at],
            )?;

            println!("Added manufacturer and manufactured_by relationship to database, {:?}", manufacturer_entry);
            to_value(&manufacturer_entry).unwrap()
        }
        Err(err) => {
            eprintln!("Error querying database: {:?}", err);
            Value::Null
        }
    };

    // println!("Manufacturer: {}", serde_json::to_string_pretty(&manufacturer_record).unwrap());

    // check that the manufacturer is trusted by a sufficiently accredited authoriser [!NEED A FIELD IN USERS TABLE FOR THIS!]

    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{read};

    #[test] 
    #[should_panic(expected = r#"called `Result::unwrap()` on an `Err` value: ErrorStack([Error { code: 109052059, library: "asn1 encoding routines"#)]
    fn check_panics_with_bad_idevid() {
        let pathToSqlDB = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/Bad_iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        assert_eq!(result, true);
    }

    #[test]
    #[should_panic(expected = "unable to open database file: ./tests/DoesntExist.sqlite")]
    fn check_panics_with_non_existent_sqlite_database() {
        let pathToSqlDB = "./tests/DoesntExist.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
    }

    #[test]
    #[should_panic(expected = "no such table: manufacturer")]
    fn check_panics_when_manufacturer_table_missing() {
        let pathToSqlDB = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        assert_eq!(result, true);
    }

    #[test]
    fn check_finds_manufacturer_is_trusted() {
        let pathToSqlDB = "./tests/EmptyTablesDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        assert_eq!(result, true);
    }


    // TODO: ADD TEST WITH DATABASE WITH MANUFACTURER TABLE EXISTING BUT EMPTY - SHOULD CHECK THAT MANUFACTURER IS INSERTED INTO TABLE

}
