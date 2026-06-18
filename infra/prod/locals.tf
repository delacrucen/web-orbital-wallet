locals {
  name        = "web-orbital-wallet"
  environment = "prod"
  bucket_name = "web-orbital-wallet-prod-${var.target_account_id}"

  tags = {
    Project     = "web-orbital-wallet"
    Environment = "prod"
    ManagedBy   = "terraform"
    Repository  = "Orbital-S/web-orbital-wallet"
  }
}
