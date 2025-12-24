use aes_gcm::{aead::Aead, aead::KeyInit, Aes256Gcm, Key, Nonce};
use base64::{engine::general_purpose, Engine as _};
use rand::RngCore;

use crate::error::AppError;

const KEYRING_SERVICE: &str = "ADuiTools";
const KEYRING_ACCOUNT: &str = "master_key_v1";

const KEY_LEN: usize = 32;   // AES-256
const NONCE_LEN: usize = 12; // GCM nonce

pub fn load_or_create_master_key() -> Result<[u8; KEY_LEN], AppError> {
  // keyring: Entry::new(service, username) + get_password/set_password
  // docs: https://docs.rs/keyring/latest/keyring/  :contentReference[oaicite:2]{index=2}
  let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
    .map_err(|e| AppError::Keyring(format!("keyring entry new failed: {e}")))?;

  if let Ok(stored) = entry.get_password() {
    let raw = general_purpose::STANDARD
      .decode(stored)
      .map_err(|e| AppError::Crypto(format!("master key base64 decode failed: {e}")))?;

    if raw.len() != KEY_LEN {
      return Err(AppError::Crypto("invalid master key length".into()));
    }

    let mut key = [0u8; KEY_LEN];
    key.copy_from_slice(&raw);
    return Ok(key);
  }

  // 不存在 => 生成并保存
  let mut key = [0u8; KEY_LEN];
  rand::thread_rng().fill_bytes(&mut key);

  let encoded = general_purpose::STANDARD.encode(key);
  entry
    .set_password(&encoded)
    .map_err(|e| AppError::Keyring(format!("keyring set_password failed: {e}")))?;

  Ok(key)
}

// 输出 base64(nonce || ciphertext)
pub fn encrypt_json(plaintext: &str) -> Result<String, AppError> {
  let master_key = load_or_create_master_key()?;
  let key = Key::<Aes256Gcm>::from_slice(&master_key);
  let cipher = Aes256Gcm::new(key);

  let mut nonce_bytes = [0u8; NONCE_LEN];
  rand::thread_rng().fill_bytes(&mut nonce_bytes);
  let nonce = Nonce::from_slice(&nonce_bytes);

  let ciphertext = cipher
    .encrypt(nonce, plaintext.as_bytes())
    .map_err(|e| AppError::Crypto(format!("encrypt failed: {e}")))?;

  let mut out = Vec::with_capacity(NONCE_LEN + ciphertext.len());
  out.extend_from_slice(&nonce_bytes);
  out.extend_from_slice(&ciphertext);

  Ok(general_purpose::STANDARD.encode(out))
}

pub fn decrypt_json(payload_b64: &str) -> Result<String, AppError> {
  let master_key = load_or_create_master_key()?;
  let key = Key::<Aes256Gcm>::from_slice(&master_key);
  let cipher = Aes256Gcm::new(key);

  let raw = general_purpose::STANDARD
    .decode(payload_b64)
    .map_err(|e| AppError::Crypto(format!("decrypt base64 decode failed: {e}")))?;

  if raw.len() <= NONCE_LEN {
    return Err(AppError::Crypto("invalid encrypted payload".into()));
  }

  let (nonce_bytes, ciphertext) = raw.split_at(NONCE_LEN);
  let nonce = Nonce::from_slice(nonce_bytes);

  let plaintext = cipher
    .decrypt(nonce, ciphertext)
    .map_err(|e| AppError::Crypto(format!("decrypt failed: {e}")))?;

  String::from_utf8(plaintext).map_err(|e| AppError::Crypto(format!("utf8 decode failed: {e}")))
}
