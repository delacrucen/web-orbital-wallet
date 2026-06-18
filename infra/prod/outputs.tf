output "bucket_name" {
  value = aws_s3_bucket.app.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.app.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "custom_domain_name" {
  value = local.custom_domain
}

output "acm_certificate_validation_records" {
  value = [
    for record in aws_acm_certificate.app.domain_validation_options : {
      name  = record.resource_record_name
      type  = record.resource_record_type
      value = record.resource_record_value
    }
  ]
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}
