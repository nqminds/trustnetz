CREATE TABLE user (
  id TEXT PRIMARY KEY,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP,
  can_issue_purchase_rights BOOLEAN,
  can_issue_connection_rights BOOLEAN,
  can_issue_trust BOOLEAN
);

CREATE TABLE device (
  id TEXT PRIMARY KEY,
  name TEXT,
  idevid TEXT,
  created_at TIMESTAMP
);

CREATE TABLE manufacturer (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP
);

CREATE TABLE device_type (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP
);

CREATE TABLE owns (
  user_id TEXT,
  device_id TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (device_id) REFERENCES device (id)
);

CREATE TABLE manufactured (
  device_id TEXT,
  manufacturer_id TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES device (id),
  FOREIGN KEY (manufacturer_id) REFERENCES manufacturer (id)
);

CREATE TABLE trusts (
  user_id TEXT,
  manufacturer_id TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (manufacturer_id) REFERENCES manufacturer (id)
);

CREATE TABLE gives_purchase_rights (
  recipient_id TEXT,
  authoriser_id TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES user (id),
  FOREIGN KEY (authoriser_id) REFERENCES user (id)
);

CREATE TABLE gives_connection_rights (
  recipient_id TEXT,
  authoriser_id TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES user (id),
  FOREIGN KEY (authoriser_id) REFERENCES user (id)
);

CREATE TABLE is_of_type (
  device_id TEXT,
  device_type_id TEXT,
  FOREIGN KEY (device_id) REFERENCES device (id),
  FOREIGN KEY (device_type_id) REFERENCES device_type (id)
);

CREATE TABLE allow_to_connect (
  device_id TEXT,
  authoriser_id TEXT,
  FOREIGN KEY (device_id) REFERENCES device (id),
  FOREIGN KEY (authoriser_id) REFERENCES user (id)
);

CREATE TABLE sbom (
  id TEXT,
  sbom TEXT,
  vulnerability_score NUMBER,
  vulnerability_score_updated TIMESTAMP
);

CREATE TABLE has_sbom (
  sbom_id TEXT,
  device_type_id TEXT
);
