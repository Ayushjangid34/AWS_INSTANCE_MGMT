    -- MySQL script to create the database and tables for AWS user management
    
    DROP DATABASE IF EXISTS AWS; -- everytime create a new database ( I use this to perform testing on fresh invironment), Please comment if needed
    CREATE DATABASE AWS;
    USE AWS;

    CREATE TABLE User (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        email      VARCHAR(255) NOT NULL UNIQUE,
        mobile     VARCHAR(10) NOT NULL UNIQUE,
        name       VARCHAR(255) NOT NULL,
        password   TEXT NOT NULL,
        createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE Instance (
        instanceId  VARCHAR(255) NOT NULL UNIQUE,
        userId      INT NOT NULL,
        instanceOS  VARCHAR(255) NOT NULL,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE UserKeys (
        KeyPairId       VARCHAR(255) PRIMARY KEY,
        KeyFingerprint  TEXT NOT NULL,
        KeyName         TEXT NOT NULL,
        KeyMaterial     TEXT NOT NULL,
        userId          INT NOT NULL UNIQUE,
        createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id)
    );
