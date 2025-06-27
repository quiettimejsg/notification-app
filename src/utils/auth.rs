use anyhow::Result;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub username: String,
    pub exp: i64,
    pub iat: i64,
}

pub struct JwtUtils;

impl JwtUtils {
    pub fn generate_token(user_id: i64, username: &str) -> Result<String> {
        let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());
        let expires_in = env::var("JWT_EXPIRES_IN")
            .unwrap_or_else(|_| "604800".to_string())
            .parse::<i64>()
            .unwrap_or(604800);

        let now = Utc::now();
        let exp = now + Duration::seconds(expires_in);

        let claims = Claims {
            sub: user_id.to_string(),
            username: username.to_string(),
            exp: exp.timestamp(),
            iat: now.timestamp(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_ref()),
        )?;

        Ok(token)
    }

    pub fn verify_token(token: &str) -> Result<TokenData<Claims>> {
        let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "default-secret".to_string());

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data)
    }
}

pub fn hash_password(password: &str) -> Result<String> {
    let hashed = bcrypt::hash(password, bcrypt::DEFAULT_COST)?;
    Ok(hashed)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool> {
    let is_valid = bcrypt::verify(password, hash)?;
    Ok(is_valid)
}

