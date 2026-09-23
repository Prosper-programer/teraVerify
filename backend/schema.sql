CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255),
    role ENUM('visitor', 'buyer', 'seller', 'surveyor', 'advisor', 'admin') NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    is_phone_verified BOOLEAN DEFAULT TRUE,
    national_id_number VARCHAR(100),
    status ENUM('active', 'suspended') DEFAULT 'active',
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lands (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    land_title_number VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    region VARCHAR(100) NOT NULL,
    division VARCHAR(100),
    subdivision VARCHAR(100),
    neighborhood VARCHAR(100),
    area_sq_m DECIMAL(12,2) NOT NULL,
    price_fcfa BIGINT NOT NULL,
    unlock_fee_fcfa BIGINT DEFAULT 10000,
    land_type ENUM('residential', 'commercial', 'agricultural', 'industrial', 'mixed_use') DEFAULT 'residential',
    topography ENUM('flat', 'gentle_slope', 'elevated', 'waterfront') DEFAULT 'flat',
    access_road ENUM('paved', 'dirt_road', 'secondary', 'servitude') DEFAULT 'dirt_road',
    images JSON,
    exact_location JSON,
    seller_contact JSON,
    verification_status ENUM('pending', 'under_review', 'verified', 'rejected') DEFAULT 'pending',
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    surveyor_notes TEXT,
    verified_at DATETIME,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    seller_id VARCHAR(64),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS land_documents (
    id VARCHAR(64) PRIMARY KEY,
    land_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('titre_foncier', 'plan_bornage', 'certificat_propriete', 'attestation_non_litige') NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    file_size VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id VARCHAR(64) PRIMARY KEY,
    land_id VARCHAR(64) NOT NULL,
    land_title_number VARCHAR(100) NOT NULL,
    seller_id VARCHAR(64) NOT NULL,
    seller_name VARCHAR(150),
    seller_phone VARCHAR(50),
    surveyor_id VARCHAR(64),
    surveyor_name VARCHAR(150),
    region VARCHAR(100),
    division VARCHAR(100),
    subdivision VARCHAR(100),
    surface_area_sq_m DECIMAL(12,2),
    status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    rejection_reason TEXT,
    surveyor_notes TEXT,
    cadastral_registry_notes TEXT,
    estimated_turnaround_hours INT DEFAULT 48,
    timeline JSON,
    FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS advisors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    title VARCHAR(150) NOT NULL,
    profession ENUM('notaire', 'geometre_expert', 'avocat_foncier', 'expert_immobilier') NOT NULL,
    organization VARCHAR(200),
    license_number VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(150),
    region VARCHAR(100),
    city VARCHAR(100),
    hourly_rate_fcfa BIGINT DEFAULT 25000,
    rating DECIMAL(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    avatar_url TEXT,
    bio TEXT,
    specializations JSON,
    availability JSON
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    advisor_id VARCHAR(64) NOT NULL,
    advisor_name VARCHAR(150) NOT NULL,
    advisor_title VARCHAR(150),
    advisor_avatar_url TEXT,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    user_email VARCHAR(150),
    date VARCHAR(20) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    consultation_type ENUM('in_person', 'video_call', 'phone_call') DEFAULT 'video_call',
    topic VARCHAR(255),
    notes TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'confirmed',
    fee_fcfa BIGINT NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    land_id VARCHAR(64) NOT NULL,
    land_title VARCHAR(255),
    amount_fcfa BIGINT NOT NULL,
    method ENUM('mtn_momo', 'orange_money') NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'success',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (land_id) REFERENCES lands(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    related_entity_id VARCHAR(64),
    related_entity_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS unlocked_lands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    land_id VARCHAR(64) NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_land (user_id, land_id)
);
