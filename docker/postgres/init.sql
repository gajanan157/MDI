-- Create separate microservice databases
CREATE DATABASE order_db;
CREATE DATABASE inventory_db;

-- Connect to inventory_db and preload sample inventory records
\c inventory_db;

CREATE TABLE IF NOT EXISTS t_inventory (
    id BIGSERIAL PRIMARY KEY,
    sku_code VARCHAR(255) NOT NULL UNIQUE,
    quantity INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_inventory (sku_code, quantity, updated_at) VALUES
('IPHONE-15', 50, CURRENT_TIMESTAMP),
('MACBOOK-PRO-M3', 25, CURRENT_TIMESTAMP),
('AIRPODS-PRO-2', 100, CURRENT_TIMESTAMP)
ON CONFLICT (sku_code) DO NOTHING;
