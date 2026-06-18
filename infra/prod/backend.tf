terraform {
  backend "s3" {
    bucket         = "web-orbital-wallet-tfstate-prod-373317458963-us-east-1"
    key            = "envs/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "web-orbital-wallet-tflocks-prod"
    encrypt        = true
  }
}
