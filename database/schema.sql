CREATE DATABASE IF NOT EXISTS job_tracker;
USE job_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255), -- For password reset
  reset_token_expiry BIGINT -- Unix timestamp for token expiry
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  location VARCHAR(50), -- Remote, Onsite, Hybrid
  salary DECIMAL(10, 2),
  date_applied DATE,
  job_link VARCHAR(255),
  notes TEXT,
  status VARCHAR(50), -- Saved, Applied, Interviewing, Offer, Rejected, Ghosted
  deadline DATE,
  interview_date DATETIME, -- For interview scheduling
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT, -- Link to specific job (nullable for unlinked files)
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- Resume, Cover Letter, Other
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT,
  type VARCHAR(50) NOT NULL, -- Deadline, Follow-up, Interview
  message TEXT NOT NULL,
  remind_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);