use openssl::x509::{X509};
use rusqlite::{params, Connection, Result, OpenFlags};
use serde::{Serialize, Deserialize};
use serde_json::{Value, to_value};
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

pub fn check_manufacturer_trusted(idevid: &X509, path_to_sql_db: &str) -> Result<bool> {

    println!("running manufaturer trusted func");
    // Create OpenFlags without SQLITE_OPEN_CREATE flag
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
    
    // Connect to SqlDB database from a file
    let conn = Connection::open_with_flags(path_to_sql_db, flags)?;

    // extract manufacturer from idevid - Issuer
    // Get the issuer name
    let issuer_name = idevid.issuer_name();
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

    println!("Manufacturer: {}", serde_json::to_string_pretty(&manufacturer_record).unwrap());

    // check that the manufacturer is trusted by a sufficiently accredited authoriser [!NEED A FIELD IN USERS TABLE FOR THIS!]

    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{read};
    use tempfile::NamedTempFile;

    // Function to perform the database copy and execute a callback with the temporary file path
    fn with_temporary_database<T, F>(
        idevid: X509,
        source_path: &str,
        callback: F,
    ) -> Result<T>
    where
        F: FnOnce(&X509, &str) -> Result<T>,
    {
        // Create a temporary file
        let temp_file = NamedTempFile::new().map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

        // Get the path of the temporary file
        let temp_file_path = temp_file.path().to_str().unwrap().to_owned();

        // Open the source database on disk
        let source_conn = Connection::open(source_path)?;

        // Attach a new in-memory database
        source_conn.execute("ATTACH DATABASE ? AS tempdb", params![&temp_file_path])?;

        // Execute SQL statement to copy data from source to temporary file
        source_conn.execute(
            "ATTACH DATABASE ? AS ondiskdb",
            params![source_path.to_owned()],
        )?;
        let table_name = "manufacturer";
        let create_table_sql = format!(
            "CREATE TABLE IF NOT EXISTS tempdb.{} AS SELECT * FROM ondiskdb.{} WHERE 0",
            table_name, table_name
        );
        source_conn.execute(&create_table_sql, params![])?;
        let insert_sql = format!(
            "INSERT INTO tempdb.{} SELECT * FROM ondiskdb.{}",
            table_name, table_name
        );
        source_conn.execute(&insert_sql, params![])?;

        source_conn.execute("DETACH DATABASE ondiskdb", params![])?;
        source_conn.execute("DETACH DATABASE tempdb", params![])?;

        // Call the callback function with the temporary file path and other arguments
        let result = callback(&idevid, &temp_file_path)?;

        // Clean up the temporary file
        temp_file.close().map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

        Ok(result)
    }

    #[test]
    #[should_panic(expected = "unable to open database file: ./tests/DoesntExist.sqlite")]
    fn check_panics_with_non_existent_sqlite_database() {
        let path_to_sql_db = "./tests/DoesntExist.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        println!("Running check NOW!!!");
        let _ = check_manufacturer_trusted(&idevid, &path_to_sql_db).unwrap();
    }

    #[test]
    #[should_panic(expected = "no such table: manufacturer")]
    fn check_panics_when_manufacturer_table_missing() {
        let path_to_sql_db = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        println!("Running check NOW!!!");
        let _ = check_manufacturer_trusted(&idevid, &path_to_sql_db).unwrap();
    }

    #[test]
    fn check_finds_manufacturer_is_trusted() {
        let path_to_sql_db = "./tests/EmptyTablesDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            println!("Running check NOW!!!");
            let result = check_manufacturer_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);

            // Create OpenFlags without SQLITE_OPEN_CREATE flag
            let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
            // Connect to SqlDB database from a file
            let conn = Connection::open_with_flags(temp_file_path, flags)?;

            let mut stmt = conn.prepare("SELECT COUNT(*) FROM manufacturer WHERE name = 'www.manufacturer.com'")?;
            let count: i64 = stmt.query_row(params![], |row| row.get(0))?;

            println!("Count: {:?}", count);

            // Check if the inserted row is present
            assert_eq!(count, 1);

            Ok(true)
        }).unwrap();
    }

}
