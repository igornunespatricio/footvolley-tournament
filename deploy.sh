#!/bin/bash

# Production Deployment Script
# This script handles complete deployment to production

set -e

echo "🚀 ASC Championship - Production Deployment"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DEPLOYMENT_ENV=${1:-docker}

case $DEPLOYMENT_ENV in
  docker)
    echo -e "${YELLOW}📦 Deploying with Docker Compose...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Load environment variables
    if [ -f .env.production ]; then
        echo -e "${YELLOW}Loading production environment...${NC}"
        export $(cat .env.production | grep -v '#' | xargs)
    else
        echo -e "${RED}❌ .env.production file not found${NC}"
        echo "Copy .env.production.example to .env.production and configure"
        exit 1
    fi
    
    # Build and start containers
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    
    echo -e "${YELLOW}Starting services...${NC}"
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Run migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose exec backend npm run migrate || true
    
    # Check service health
    echo -e "${YELLOW}Checking service health...${NC}"
    
    if docker-compose exec -T postgres pg_isready -U footvolley &> /dev/null; then
        echo -e "${GREEN}✅ Database is ready${NC}"
    else
        echo -e "${RED}❌ Database failed to start${NC}"
        docker-compose logs postgres
        exit 1
    fi
    
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        docker-compose logs backend
        exit 1
    fi
    
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "Access your application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001"
    echo ""
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart"
    ;;
    
  vercel)
    echo -e "${YELLOW}🚀 Deploying Frontend to Vercel...${NC}"
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm i -g vercel
    fi
    
    cd frontend
    vercel --prod
    cd ..
    
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
    ;;
    
  render)
    echo -e "${YELLOW}🚀 Setting up Render deployment...${NC}"
    
    echo "To deploy to Render:"
    echo "1. Push your code to GitHub"
    echo "2. Create account at https://render.com"
    echo "3. Create PostgreSQL database:"
    echo "   - Name: footvolley"
    echo "   - Username: footvolley"
    echo "   - Password: (strong password)"
    echo "4. Create Web Service:"
    echo "   - Connect GitHub repo"
    echo "   - Build Command: npm run migrate"
    echo "   - Start Command: npm start"
    echo "   - Environment Variables:"
    echo "     DATABASE_URL: <PostgreSQL URL>"
    echo "     NODE_ENV: production"
    ;;
    
  *)
    echo -e "${RED}Unknown deployment method: $DEPLOYMENT_ENV${NC}"
    echo "Usage: ./deploy.sh [docker|vercel|render]"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
