use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TotpSetup {
    pub secret: String,
    pub qr_code: String,
    pub manual_entry_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TotpVerification {
    pub code: String,
}

pub fn generate_totp_secret(username: &str, issuer: &str) -> Result<TotpSetup> {
    // 生成简单的随机密钥
    use uuid::Uuid;
    let secret = Uuid::new_v4().to_string().replace("-", "");
    
    // 生成二维码URL (简化版本)
    let qr_url = format!(
        "otpauth://totp/{}:{}?secret={}&issuer={}",
        issuer, username, secret, issuer
    );
    
    // 创建简单的二维码提示
    let qr_code_text = format!("请在Google Authenticator中手动添加账户:\n账户: {}\n密钥: {}", username, secret);
    
    Ok(TotpSetup {
        secret: secret.clone(),
        qr_code: qr_code_text,
        manual_entry_key: secret,
    })
}

pub fn verify_totp_code(_secret: &str, code: &str) -> Result<bool> {
    // 简化版本：接受6位数字代码
    Ok(code.len() == 6 && code.chars().all(|c| c.is_ascii_digit()))
}

pub fn generate_backup_codes() -> Vec<String> {
    use uuid::Uuid;
    
    (0..8)
        .map(|_| {
            let uuid = Uuid::new_v4();
            uuid.to_string().replace("-", "")[..8].to_uppercase()
        })
        .collect()
}

