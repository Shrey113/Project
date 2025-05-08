-- SQL script to add necessary database changes for external user management and anyone access

-- Add is_external column to drive_file_access table
ALTER TABLE drive_file_access 
ADD COLUMN is_external BOOLEAN DEFAULT FALSE;

-- Add shared_public column to drive_folders table if it doesn't exist
ALTER TABLE drive_folders
ADD COLUMN shared_public BOOLEAN DEFAULT FALSE;

-- Add shared_public column to drive_files table if it doesn't exist 
ALTER TABLE drive_files
ADD COLUMN shared_public BOOLEAN DEFAULT FALSE;

-- Create new table for external users
CREATE TABLE IF NOT EXISTS external_users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- Stores bcrypt hashed passwords
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT NULL,
  created_by VARCHAR(255) NOT NULL, -- Email of internal user who created this external user
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id),
  INDEX (email)
);

-- Create table for public access links
CREATE TABLE IF NOT EXISTS public_access_links (
  id INT NOT NULL AUTO_INCREMENT,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  folder_id INT DEFAULT NULL,
  file_id INT DEFAULT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (id),
  INDEX (access_token),
  CONSTRAINT public_access_folder FOREIGN KEY (folder_id) 
    REFERENCES drive_folders(folder_id) ON DELETE CASCADE,
  CONSTRAINT public_access_file FOREIGN KEY (file_id) 
    REFERENCES drive_files(file_id) ON DELETE CASCADE
);

-- Add appropriate permissions in the drive_file_access table for updated enum values
ALTER TABLE drive_file_access 
MODIFY COLUMN permission ENUM('read', 'write', 'admin', 'READ', 'WRITE', 'ADMIN') NOT NULL; 