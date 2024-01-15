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

pub fn add(left: usize, right: usize) -> usize {
    left + right
}

pub fn check_manufacturer_trusted(iDeVID: X509, pathToSqlDB: String) -> Result<bool> {
    // Create OpenFlags without SQLITE_OPEN_CREATE flag
    let flags = OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
    
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

    // Check manufacturer in database, If manufacturer not present in database, add them to database, so that a user may choose to trust them or not, at a later stage
    // let mut get_manufacturer_statement = conn.prepare("SELECT * FROM manufacturer WHERE (manufacturer.id = ? OR manufacturer.name = ?)")?;
    // let manufacturer_record: Value = match get_manufacturer_statement.query_row(params![manufacturer_id.to_owned(), manufacturer_name.to_owned()], |row| {
    //     Ok(Manufacturer {
    //         id: row.get(0)?,
    //         name: row.get(1)?,
    //         created_at: row.get(2)?,
    //     })
    // }) {
    //     Ok(manufacturer) => {
    //         println!("Manufacturer found in database: {:?}", manufacturer);
    //         to_value(&manufacturer).unwrap()
    //     }
    //     Err(rusqlite::Error::QueryReturnedNoRows) => {
    //         println!("No matching manufacturer found in database");

    //         // Your existing code for adding the manufacturer to the database...
    //         let now = Utc::now();
    //         let datetime = DateTime::<Utc>::from(now);
    //         let timestamp_str = datetime.format("%Y-%m-%dT%H:%M:%S.%3fZ").to_string();
    //         println!("timestamp: {}", timestamp_str);

    //         let uuid = Uuid::new_v4();
    //         let manufacturer_entry = Manufacturer {
    //             id: if manufacturer_id.to_owned() != "null" {manufacturer_id.to_owned()} else {uuid.to_string()},
    //             name: manufacturer_name.to_owned(),
    //             created_at: timestamp_str.to_owned(),
    //         };

    //         conn.execute(
    //             "INSERT INTO manufacturer (id, name, created_at) VALUES (?, ?, ?)",
    //             params![manufacturer_entry.id, manufacturer_entry.name, manufacturer_entry.created_at],
    //         )?;
    //         // Insert the manufactured_by relationship
    //         conn.execute(
    //             "INSERT INTO manufactured (device_id, manufacturer_id, created_at) VALUES (?, ?, ?)",
    //             params![device_id.to_owned(), manufacturer_entry.id, timestamp_str],
    //         )?;

    //         println!("Added manufacturer and manufactured_by relationship to database, {:?}", manufacturer_entry);
    //         to_value(&manufacturer_entry).unwrap()
    //     }
    //     Err(err) => {
    //         eprintln!("Error querying database: {:?}", err);
    //         Value::Null
    //     }
    // };

    // println!("Manufacturer: {}", serde_json::to_string_pretty(&manufacturer_record).unwrap());

    // check that the manufacturer is trusted by a sufficiently accredited authoriser [!NEED A FIELD IN USERS TABLE FOR THIS!]

    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{read};

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    #[should_panic]
    fn check_panics_with_non_existent_sqlite_database() {
        let pathToSqlDB = "./tests/DoesntExist.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        // assert_eq!(result, Ok(true));
    }

    #[test]
    #[should_panic]
    fn check_panics_with_bad_idevid() {
        let pathToSqlDB = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/Bad_iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        assert_eq!(result, true);
    }

    #[test]
    fn check_opens_sql_connection() {
        let pathToSqlDB = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let result = check_manufacturer_trusted(idevid, pathToSqlDB.to_string()).unwrap();
        assert_eq!(result, true);
    }
}
