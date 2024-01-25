use openssl::asn1::Asn1Integer;
use openssl::x509::{X509, X509Name, X509Extension, X509Builder};
use openssl::rsa::Rsa;
use openssl::pkey::PKey;
use rusqlite::{params, Connection, Error, Result, OpenFlags};
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

    let manufacturer_name = issuer_name_str.to_owned();

    // Check manufacturer in database, If manufacturer not present in database, add them to database, so that a user may choose to trust them or not, at a later stage
    let mut get_manufacturer_statement = conn.prepare("SELECT * FROM manufacturer WHERE manufacturer.name = ?")?;
    let manufacturer_record: Value = match get_manufacturer_statement.query_row(params![manufacturer_name.to_owned()], |row| {
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

            let uuid = Uuid::new_v4();
            let manufacturer_entry = Manufacturer {
                id: uuid.to_string(),
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

    let manufacturer_id = manufacturer_record["id"].to_string().trim_matches('"').to_owned();

    // check that the manufacturer is trusted by a sufficiently accredited authoriser [!NEED A FIELD IN USERS TABLE FOR THIS!]
    let manufacturer_trusted: Result<Option<bool>> = conn.query_row(
        "
        SELECT DISTINCT
            CASE
                WHEN u.can_issue_trust IS NOT NULL THEN 1
                ELSE 0
            END AS is_trusted
        FROM
            user u
        JOIN
            trusts t ON u.id = t.user_id
        JOIN
            manufacturer m ON t.manufacturer_id = m.id
        WHERE
            m.id = ?;
        ",
        params![manufacturer_id],
        |row| row.get(0),
    );

    match manufacturer_trusted {
        Ok(Some(is_trusted)) => {
            println!("manufacturer_trusted: {:?}", is_trusted);
            Ok(is_trusted)
        }
        Ok(None) => {
            println!("No rows returned for manufacturer_trusted");
            Ok(false)
        }
        Err(Error::QueryReturnedNoRows) => {
            println!("No rows returned for manufacturer_trusted");
            Ok(false)
        }
        Err(err) => {
            eprintln!("Error querying database for manufacturer_trusted: {:?}", err);
            Err(err)
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Device {
    id: String,
    name: String,
    idevid: String,
    created_at: String,
}

pub fn check_device_trusted(idevid: &X509, path_to_sql_db: &str) -> Result<bool> {
    let manufacturer_trusted = check_manufacturer_trusted(idevid, path_to_sql_db);
    match manufacturer_trusted {
        Ok(true) => {
            println!("Device's manufacturer trusted, proceeding to check device is trusted...");
        }
        Ok(false) => {
            println!("Device's manufacturer untrusted, device is therefore untrusted");
            return Ok(false)
        }
        Err(err) => {
            eprintln!("Error in check_manufacturer_trusted: {:?}", err);
            return Ok(false)
        }
    }

    // Create OpenFlags without SQLITE_OPEN_CREATE flag
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
    
    // Connect to SqlDB database from a file
    let conn = Connection::open_with_flags(path_to_sql_db, flags)?;

    // extract deviceId and manufacturer from idevid
    let issuer_name = idevid.issuer_name();
    let subject_name = idevid.subject_name();

    // Convert the issuer name to a human-readable string
    let issuer_name_str = issuer_name
        .entries_by_nid(openssl::nid::Nid::COMMONNAME)
        .next()
        .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
        .unwrap_or_else(|| "Unknown Issuer".to_string());
    let subject_name_str = subject_name
        .entries_by_nid(openssl::nid::Nid::COMMONNAME)
        .next()
        .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
        .unwrap_or_else(|| "Unknown Subject Name".to_string());

    let manufacturer_name = issuer_name_str.to_owned();
    let device_name = subject_name_str.to_owned();

    // Find pledge's device entity in device table, if it doesn't exist, add device entity
    let mut get_device_statement = conn.prepare("SELECT * FROM device WHERE device.name = ?")?;

    let pledge_device: Value = match get_device_statement.query_row(params![device_name], |row| {
        Ok(Device {
            id: row.get(0)?,
            name: row.get(1)?,
            idevid: row.get(2)?,
            created_at: row.get(3)?,
        })
    }) {
       Ok(pledge) => {
           println!("Device found in database: {:?}", pledge);
           to_value(&pledge).unwrap()
       }
       Err(rusqlite::Error::QueryReturnedNoRows) => {
           println!("No matching device found in database");

           // Adding the device to the database
           let now = Utc::now();
           let datetime = DateTime::<Utc>::from(now);
           let timestamp_str = datetime.format("%Y-%m-%dT%H:%M:%S.%3fZ").to_string();
        
           let uuid = Uuid::new_v4();
           let pledge = Device {
               id: uuid.to_string(),
               name: device_name.to_owned(),
               idevid: "your_idevid".to_owned(),
               created_at: timestamp_str,
           };

           conn.execute(
               "INSERT INTO device (id, name, idevid, created_at) VALUES (?, ?, ?, ?)",
               params![pledge.id, pledge.name, pledge.idevid, pledge.created_at],
           )?;

           println!("Added pledge device to database, {:?}", pledge);
           to_value(&pledge).unwrap()
       }
       Err(err) => {
           eprintln!("Error querying database: {:?}", err);
           Value::Null
       }
   };

   println!("Pledge device: {}", serde_json::to_string_pretty(&pledge_device).unwrap());
   let device_id = pledge_device["id"].to_string().trim_matches('"').to_owned();


    // Find pledge's manufacturer entity in manufacturer table and insert manufactured_by relationship,
    let mut get_manufacturer_statement = conn.prepare("SELECT * FROM manufacturer WHERE manufacturer.name = ?")?;
    let manufacturer_record: Value = match get_manufacturer_statement.query_row(params![manufacturer_name.to_owned()], |row| {
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
        Err(err) => {
            eprintln!("Error querying database: {:?}", err);
            Value::Null
        }
    };

    println!("Manufacturer: {}", serde_json::to_string_pretty(&manufacturer_record).unwrap());

    // Query to check if the device is allowed to connect
    let is_allowed_to_connect: Result<Option<bool>> = conn.query_row(
        "
        SELECT CASE
                WHEN atc.device_id IS NOT NULL OR (o.user_id IS NOT NULL AND u.can_issue_connection_rights) THEN 1
                ELSE 0
            END AS is_allowed_to_connect
        FROM device d
        LEFT JOIN owns o ON d.id = o.device_id
        LEFT JOIN user u ON o.user_id = u.id
        LEFT JOIN allow_to_connect atc ON d.id = atc.device_id
        WHERE d.id = ?;
        ",
        params![device_id],
        |row| row.get(0),
    );

    match is_allowed_to_connect {
        Ok(Some(is_allowed)) => {
            println!("is_allowed_to_connect: {:?}", is_allowed);
            Ok(is_allowed)
        }
        Ok(None) => {
            println!("No rows returned for is_allowed_to_connect");
            Ok(false)
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            println!("No rows returned for is_allowed_to_connect");
            Ok(false)
        }
        Err(err) => {
            eprintln!("Error querying database for is_allowed_to_connect: {:?}", err);
            Err(err)
        }
    }
}

pub fn check_device_vulnerable(idevid: &X509, path_to_sql_db: &str) -> Result<bool> {
    // Create OpenFlags without SQLITE_OPEN_CREATE flag
    let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
    
    // Connect to SqlDB database from a file
    let conn = Connection::open_with_flags(path_to_sql_db, flags)?;

    // extract deviceId and manufacturer from idevid
    let subject_name = idevid.subject_name();

    let subject_name_str = subject_name
        .entries_by_nid(openssl::nid::Nid::COMMONNAME)
        .next()
        .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
        .unwrap_or_else(|| "Unknown Subject Name".to_string());

    let device_name = subject_name_str.to_owned();

    // Find pledge's device entity in device table, if it doesn't exist, add device entity
    let mut get_device_statement = conn.prepare("SELECT * FROM device WHERE device.name = ?")?;

    let pledge_device: Value = match get_device_statement.query_row(params![device_name], |row| {
        Ok(Device {
            id: row.get(0)?,
            name: row.get(1)?,
            idevid: row.get(2)?,
            created_at: row.get(3)?,
        })
    }) {
       Ok(pledge) => {
           println!("Device found in database: {:?}", pledge);
           to_value(&pledge).unwrap()
       }
       Err(rusqlite::Error::QueryReturnedNoRows) => {
           println!("No matching device found in database");

           // Adding the device to the database
           let now = Utc::now();
           let datetime = DateTime::<Utc>::from(now);
           let timestamp_str = datetime.format("%Y-%m-%dT%H:%M:%S.%3fZ").to_string();
        
           let uuid = Uuid::new_v4();
           let pledge = Device {
               id: uuid.to_string(),
               name: device_name.to_owned(),
               idevid: "your_idevid".to_owned(),
               created_at: timestamp_str,
           };

           conn.execute(
               "INSERT INTO device (id, name, idevid, created_at) VALUES (?, ?, ?, ?)",
               params![pledge.id, pledge.name, pledge.idevid, pledge.created_at],
           )?;

           println!("Added pledge device to database, {:?}", pledge);
           to_value(&pledge).unwrap()
       }
       Err(err) => {
           eprintln!("Error querying database: {:?}", err);
           Value::Null
       }
   };

   println!("Pledge device: {}", serde_json::to_string_pretty(&pledge_device).unwrap());
   let device_id = pledge_device["id"].to_string().trim_matches('"').to_owned();


    // Query to check if the device type is safe
    let is_device_type_safe: Result<Option<bool>> = conn.query_row(
        "
        SELECT CASE
                WHEN dtv.critical_count = 0 AND dtv.high_count = 0 
                THEN 1
                ELSE 0
            END AS is_device_type_safe
        FROM device d
        LEFT JOIN is_of_type iot ON d.id = iot.device_id
        LEFT JOIN device_type dt ON iot.device_type_id = dt.id
        LEFT JOIN (
            SELECT 
                dt.id AS device_type_id, 
                COUNT(CASE WHEN v.severity = 'Critical' THEN 1 ELSE NULL END) AS critical_count,
                COUNT(CASE WHEN v.severity = 'High' THEN 1 ELSE NULL END) AS high_count
            FROM device_type dt
            LEFT JOIN has_vulnerability hv ON dt.id = hv.device_type_id
            LEFT JOIN vulnerability v ON hv.vulnerability_id = v.id
            GROUP BY dt.id
        ) dtv ON dt.id = dtv.device_type_id
        WHERE d.id = ?;
        ",
        params![device_id],
        |row| row.get(0),
    );

    match is_device_type_safe {
        Ok(Some(is_safe)) => {
            println!("is_device_type_vulnerable: {:?}", !is_safe);
            Ok(!is_safe)
        }
        Ok(None) => {
            println!("No rows returned for is_device_type_safe");
            Ok(true)
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            println!("No rows returned for is_device_type_safe");
            Ok(true)
        }
        Err(err) => {
            eprintln!("Error querying database for is_device_type_safe: {:?}", err);
            Err(err)
        }
    }
}

fn generate_x509_certificate(serial_number: u32, issuer_name: &str) -> Result<X509, openssl::error::ErrorStack> {
    // Generate a new RSA key pair
    let rsa = Rsa::generate(2048)?;
    let private_key = PKey::from_rsa(rsa)?;

    // Create a new X.509 certificate
    let mut builder = X509Builder::new()?;
    builder.set_version(2)?;

    // Set the serial number
    let serial_asn1 = Asn1Integer::from_bn(&openssl::bn::BigNum::from_u32(serial_number).unwrap())?;
    builder.set_serial_number(&serial_asn1)?;

    // Set the issuer name
    let mut issuer_name_builder = X509Name::builder()?;
    issuer_name_builder.append_entry_by_nid(openssl::nid::Nid::COMMONNAME, issuer_name)?;
    let issuer_name = issuer_name_builder.build();
    builder.set_issuer_name(&issuer_name)?;

    // Convert the serial number to a string for the subject name
    let subject_name_str = serial_number.to_string();
    // Set the subject name to the serial number converted to a string
    let mut subject_name_builder = X509Name::builder()?;
    subject_name_builder.append_entry_by_nid(openssl::nid::Nid::COMMONNAME, &subject_name_str)?;
    let subject_name = subject_name_builder.build();
    builder.set_subject_name(&subject_name)?;
    

    // Set validity period (in this example, valid for 365 days)
    builder.set_not_before(openssl::asn1::Asn1Time::days_from_now(0)?.as_ref())?;
    builder.set_not_after(openssl::asn1::Asn1Time::days_from_now(365)?.as_ref())?;

    // Attach a public key to the certificate
    builder.set_pubkey(&private_key)?;

    // Add a basic key usage extension (if needed)
    let key_usage_extension = X509Extension::new(None, None, "keyUsage", "digitalSignature")?;
    builder.append_extension(key_usage_extension)?;

    // Build the X509 certificate
    let certificate = builder.build();

    Ok(certificate)
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


        // List of table names to copy
        let table_names = vec![
            "allow_to_connect",
            "device",
            "device_type",
            "gives_connection_rights",
            "has_vulnerability",
            "is_of_type",
            "manufactured",
            "manufacturer",
            "owns",
            "trusts",
            "user",
            "vulnerability",
        ];

        // Iterate over each table and create it in tempdb
        for table_name in &table_names {
            let create_table_sql = format!(
                "CREATE TABLE IF NOT EXISTS tempdb.{} AS SELECT * FROM ondiskdb.{} WHERE 0",
                table_name, table_name
            );
            source_conn.execute(&create_table_sql, params![])?;
        }

        // Iterate over each table and copy data
        for table_name in &table_names {
            let insert_sql = format!(
                "INSERT INTO tempdb.{} SELECT * FROM ondiskdb.{}",
                table_name, table_name
            );
            source_conn.execute(&insert_sql, params![])?;
        }

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
        let _ = check_manufacturer_trusted(&idevid, &path_to_sql_db).unwrap();
    }

    #[test]
    #[should_panic(expected = "no such table: manufacturer")]
    fn check_panics_when_manufacturer_table_missing() {
        let path_to_sql_db = "./tests/EmptyDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();
        let _ = check_manufacturer_trusted(&idevid, &path_to_sql_db).unwrap();
    }

    #[test]
    fn check_manufacturer_is_untrusted() {
        let path_to_sql_db = "./tests/ExistingManufacturerUntrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_manufacturer_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_manufacturer_is_added_and_untrusted() {
        let path_to_sql_db = "./tests/EmptyTablesDatabase.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_manufacturer_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);

            // Create OpenFlags without SQLITE_OPEN_CREATE flag
            let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
            // Connect to SqlDB database from a file
            let conn = Connection::open_with_flags(temp_file_path, flags)?;

            let mut stmt = conn.prepare("SELECT COUNT(*) FROM manufacturer WHERE name = 'www.manufacturer.com'")?;
            let count: i64 = stmt.query_row(params![], |row| row.get(0))?;

            // Check if the inserted row is present
            assert_eq!(count, 1);

            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_manufacturer_is_untrusted_when_user_cant_issue_trust() {
        let path_to_sql_db = "./tests/ExistingManufacturerTrustedWithInsufficientPermissions.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_manufacturer_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_manufacturer_is_trusted() {
        let path_to_sql_db = "./tests/ExistingManufacturerTrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_manufacturer_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, true);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_untrusted_because_manufacturer_is_untrusted() {
        let path_to_sql_db = "./tests/ExistingManufacturerUntrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_and_manufactured_by_created_manufacturer_is_trusted() {
        let path_to_sql_db = "./tests/ExistingManufacturerTrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_trusted(idevid, temp_file_path).unwrap();

            // Create OpenFlags without SQLITE_OPEN_CREATE flag
            let flags = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_FULL_MUTEX;
            // Connect to SqlDB database from a file
            let conn = Connection::open_with_flags(temp_file_path, flags)?;

            let mut stmt = conn.prepare("SELECT COUNT(*) FROM device WHERE name = 'www.client.com'")?;
            let count: i64 = stmt.query_row(params![], |row| row.get(0))?;

            // Check if the inserted row is present
            assert_eq!(count, 1);

            let mut stmt = conn.prepare("SELECT COUNT(*) FROM manufactured")?;
            let count: i64 = stmt.query_row(params![], |row| row.get(0))?;

            // Check if the inserted row is present
            assert_eq!(count, 1);

            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_is_trusted() {
        let path_to_sql_db = "./tests/ExistingDeviceTrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, true);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_with_no_type_is_vulnerable() {
        let path_to_sql_db = "./tests/ExistingDeviceTrusted.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_vulnerable(idevid, temp_file_path).unwrap();
            assert_eq!(result, true);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_with_type_with_no_vulnerabilities_is_not_vulnerable() {
        let path_to_sql_db = "./tests/ExistingTrustedDeviceWithType.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_vulnerable(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_with_type_with_vulnerabilities_is_vulnerable() {
        let path_to_sql_db = "./tests/ExistingTrustedDeviceWithVulnerableType.sqlite";
        let idevid = read(format!("./tests/iDevID"))
            .map(|bytes| X509::from_pem(bytes.as_slice()).unwrap())
            .unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_vulnerable(idevid, temp_file_path).unwrap();
            assert_eq!(result, true);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_generates_validx509_cert() {
        let serial_number = 123;
        let serial_number_str = serial_number.to_string();
        let issuer_name: &str = "idevca";
        
        match generate_x509_certificate(serial_number, issuer_name) {
            Ok(certificate) => {
                // Get the issuer name
                let issuer_name_extracted = certificate.issuer_name();
                // Convert the issuer name to a human-readable string
                let issuer_name_str = issuer_name_extracted
                    .entries_by_nid(openssl::nid::Nid::COMMONNAME)
                    .next()
                    .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
                    .unwrap_or_else(|| "Unknown Issuer".to_string());
                println!("ISSUER NAME::: {:?}", issuer_name_extracted);
                println!("ISSUER NAME STR::: {:?}", issuer_name_str);
                let manufacturer_name = issuer_name_str.to_owned();
                println!("MANUFACTURER NAME::: {:?}", manufacturer_name);
                assert_eq!(manufacturer_name, issuer_name);

                // Get the subject name
                let subject_name = certificate.subject_name();

                let subject_name_str = subject_name
                    .entries_by_nid(openssl::nid::Nid::COMMONNAME)
                    .next()
                    .map(|entry| entry.data().as_utf8().unwrap().to_string()) // Convert &str to String
                    .unwrap_or_else(|| "Unknown Subject Name".to_string());
            
                let device_name = subject_name_str.to_owned();
                println!("DEVICE NAME::: {:?}", device_name);
                assert_eq!(device_name, serial_number_str);
            }
            Err(err) => eprintln!("Error generating certificate: {}", err),
        }
    }

    #[test]
    fn check_generated_cert_from_serial_number_is_accepted_but_untrusted() {
        let path_to_sql_db = "./tests/EmptyTablesDatabase.sqlite";
        let idevid = generate_x509_certificate(2, "www.manufacturer.com").unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, false);
            Ok(true)
        }).unwrap();
    }

    #[test]
    fn check_device_generating_cert_from_serial_number_is_trusted() {
        let path_to_sql_db = "./tests/ExistingDeviceUsingSerialNumberTrusted.sqlite";
        let idevid = generate_x509_certificate(2, "www.manufacturer.com").unwrap();

        // Use with_temporary_database to perform the operation and check the result
        let _ = with_temporary_database(idevid, path_to_sql_db, |idevid, temp_file_path| {
            let result = check_device_trusted(idevid, temp_file_path).unwrap();
            assert_eq!(result, true);
            Ok(true)
        }).unwrap();
    }
}
