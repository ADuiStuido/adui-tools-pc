use aes_gcm::{aead::Aead, aead::KeyInit, Aes256Gcm, Key, Nonce};
use base64::{engine::general_purpose, Engine as _};
use rand::RngCore;

use crate::error::AppError;

const KEYRING_SERVICE: &str = "ADuiTools";
const KEYRING_ACCOUNT: &str = "master_key_v1";

const KEY_LEN: usize = 32;
const NONCE_LEN: usize = 12;

static MASTER_KEY_CACHE: std::sync::OnceLock<[u8; KEY_LEN]> = std::sync::OnceLock::new();

pub fn load_or_create_master_key() -> Result<[u8; KEY_LEN], AppError> {
  if let Some(k) = MASTER_KEY_CACHE.get() {
    return Ok(*k);
  }

  let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
    .map_err(|e| AppError::Keyring(format!("keyring entry new failed: {e}")))?;

  match entry.get_password() {
    Ok(stored) => {
      let raw = general_purpose::STANDARD
        .decode(stored)
        .map_err(|e| AppError::Crypto(format!("master key base64 decode failed: {e}")))?;

      if raw.len() != KEY_LEN {
        return Err(AppError::Crypto("invalid master key length".into()));
      }

      let mut key = [0u8; KEY_LEN];
      key.copy_from_slice(&raw);

      let _ = MASTER_KEY_CACHE.set(key);
      Ok(key)
    }

    // ✅ 只有 “确实不存在条目” 才生成新主密钥
    Err(keyring::Error::NoEntry) => {
      let mut key = [0u8; KEY_LEN];
      rand::thread_rng().fill_bytes(&mut key);

      let encoded = general_purpose::STANDARD.encode(key);
      entry
        .set_password(&encoded)
        .map_err(|e| AppError::Keyring(format!("keyring set_password failed: {e}")))?;

      let _ = MASTER_KEY_CACHE.set(key);
      Ok(key)
    }

    // ❌ 其它错误都不要生成新 key，否则会导致你现在这种“每次 key 不同”
    Err(e) => Err(AppError::Keyring(format!("keyring get_password failed: {e}"))),
  }
}

pub fn encrypt_json(plaintext: &str) -> Result<String, AppError> {
  let master_key = load_or_create_master_key()?;
  let key = Key::<Aes256Gcm>::from_slice(&master_key);
  let cipher = Aes256Gcm::new(key);

  let mut nonce_bytes = [0u8; NONCE_LEN];
  rand::thread_rng().fill_bytes(&mut nonce_bytes);
  let nonce = Nonce::from_slice(&nonce_bytes);

  let ciphertext = cipher
    .encrypt(nonce, plaintext.as_bytes())
    .map_err(|_| AppError::Crypto("encrypt failed: aead::Error".into()))?;

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
    .map_err(|_| AppError::Crypto("decrypt failed: aead::Error".into()))?;

  String::from_utf8(plaintext).map_err(|e| AppError::Crypto(format!("utf8 decode failed: {e}")))
}
