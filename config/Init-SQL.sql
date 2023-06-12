-- Create the Users table
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_image VARCHAR(255) DEFAULT NULL,
    user_auth_provider INT DEFAULT 4,
    user_is_native_registration BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_auth_provider) REFERENCES authprovider (authprovider_id)
);


-- Create the GoogleAuthAccounts table
CREATE TABLE googleauthaccounts (
    google_auth_id INT PRIMARY KEY AUTO_INCREMENT,
    google_user_id INT,
    google_id VARCHAR(100),
    FOREIGN KEY (google_user_id) REFERENCES user(user_id)
);

-- Create the NativeAuthAccounts table
CREATE TABLE authprovider (
    authprovider_id INT PRIMARY KEY AUTO_INCREMENT,
    authprovider_name VARCHAR(20) NOT NULL,
);

INSERT INTO authprovider (authprovider_name)
VALUES
  ('Google'),
  ('Facebook'),
  ('Twitter'),
  ('None');

