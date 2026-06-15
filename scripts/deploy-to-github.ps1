# PacketFlow - GitHub Deployment Script
# Run this on your local machine with Git and GitHub CLI installed

$REPO_NAME = "packetflow"
$GITHUB_USER = "shubhamshahdev"
$PROJECT_DIR = "C:\Users\HP\OneDrive\Documents\Project1\PacketFlow"

# Navigate to project
Set-Location -LiteralPath $PROJECT_DIR

# Initialize git
git init

# Create .gitignore if not exists (already included in project)
# Stage all files
git add -A

# Initial commit
git commit -m "feat: initial release of PacketFlow - Network Simulation & Packet Analysis Platform

- Drag-and-drop network topology builder with 8 device types
- Packet flow visualization with OSI layer inspection
- Routing simulation (Static, RIP, OSPF)
- Network diagnostics (Ping, Traceroute, Port Scanner)
- Real-time statistics dashboard with charts
- JWT authentication with role-based access
- Dark/light theme support
- RESTful API with Swagger/OpenAPI documentation
- PostgreSQL database with Prisma ORM
- Docker containerization
- CI/CD pipeline with GitHub Actions"

# Create GitHub repository
gh repo create $GITHUB_USER/$REPO_NAME --public --description "PacketFlow - A production-grade network simulation and packet analysis platform with drag-and-drop topology builder, packet flow visualization, routing simulation, and network diagnostics." --homepage "https://github.com/$GITHUB_USER/$REPO_NAME"

# Add remote and push
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main
git push -u origin main

Write-Host "Deployment complete! Repository: https://github.com/$GITHUB_USER/$REPO_NAME" -ForegroundColor Green
