use openssl::x509::{X509};
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
