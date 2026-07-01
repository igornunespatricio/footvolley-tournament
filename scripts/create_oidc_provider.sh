# Create an OpenID Connect (OIDC) identity provider in IAM via CLI, then create a role trusting it.
# This script assumes that you have the AWS CLI installed and configured with the necessary permissions.

#!/bin/bash

GITHUB_BRANCH="main"  # default

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --org) GITHUB_ORG="$2"; shift ;;
    --repo) GITHUB_REPOSITORY="$2"; shift ;;
    --branch) GITHUB_BRANCH="$2"; shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

echo "Org: $GITHUB_ORG"
echo "Repo: $GITHUB_REPOSITORY"
echo "Branch: $GITHUB_BRANCH"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ROLE_NAME="github-actions-role"
FILE_PATH="../assets/trust-policy.json"

# list OIDC providers
echo "List of existing OIDC providers:"
aws iam list-open-id-connect-providers

# check if github.com is already an OIDC provider
github_oidc_provider_exists=$(aws iam list-open-id-connect-providers | grep "token.actions.githubusercontent.com")
if [ -n "$github_oidc_provider_exists" ]; then
  echo "GitHub OIDC provider already exists."
else
  echo "GitHub OIDC provider does not exist. Creating..."
  aws iam create-open-id-connect-provider --url "https://token.actions.githubusercontent.com" --client-id-list "sts.amazonaws.com"
  # Verify that the OIDC provider was created successfully
  if [ $? -eq 0 ]; then
    echo "GitHub OIDC provider created successfully."
  else
    echo "Failed to create GitHub OIDC provider."
    exit 1
  fi
fi

# Build the trust policy dynamically allowing just branches
cat > "$FILE_PATH" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPOSITORY}:ref:refs/heads/*"
        }
      }
    }
  ]
}
EOF

# check if the role already exists
role_exists=$(aws iam get-role --role-name "$ROLE_NAME" 2>&1)
if echo "$role_exists" | grep -q "NoSuchEntity"; then
  echo "Role $ROLE_NAME does not exist. Creating..."
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://"$FILE_PATH"

  if [ $? -eq 0 ]; then
    echo "Role $ROLE_NAME created successfully."
  else
    echo "Failed to create role $ROLE_NAME."
    exit 1
  fi
else
  echo "Role $ROLE_NAME already exists. Updating trust policy..."
  aws iam update-assume-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-document file://"$FILE_PATH"

  if [ $? -eq 0 ]; then
    echo "Trust policy for $ROLE_NAME updated successfully."
  else
    echo "Failed to update trust policy for $ROLE_NAME."
    exit 1
  fi
fi

echo "Done. Role ARN:"
aws iam get-role --role-name "$ROLE_NAME" --query "Role.Arn" --output text