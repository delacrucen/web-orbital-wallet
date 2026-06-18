output "bucket_name" {
  value = aws_s3_bucket.app.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.app.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}
