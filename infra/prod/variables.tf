variable "aws_profile" {
  description = "AWS CLI profile used for local production operations."
  type        = string
  default     = "orbitalsolutions"
}

variable "aws_region" {
  description = "AWS region for production resources."
  type        = string
  default     = "us-east-1"
}

variable "target_account_id" {
  description = "AWS account allowed for production operations."
  type        = string
  default     = "373317458963"
}
