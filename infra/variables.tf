variable "repo_url" {
  description = "Git repository URL to clone"
  type        = string
  default     = "https://github.com/igornunespatricio/footvolley-tournament.git"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Port your app listens on"
  type        = number
  default     = 3000
}
