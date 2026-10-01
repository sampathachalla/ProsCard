-- Devices that added a card's Apple Wallet pass (Apple's pass web service registrations).
-- serial_number is the card id; a row exists while the pass is in that device's Wallet.
CREATE TABLE IF NOT EXISTS wallet_registrations (
  device_library_id TEXT NOT NULL,
  pass_type_id TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_library_id, pass_type_id, serial_number)
);
CREATE INDEX IF NOT EXISTS wallet_registrations_serial_idx ON wallet_registrations(pass_type_id, serial_number);
