#!/bin/bash

# ChronoFlow Deployment Script
# Usage: ./deploy/deploy.sh [command]
#
# Commands:
#   dev       - Start development environment (MySQL + Backend + Frontend)
#   prod      - Start production environment (MySQL + Backend + Nginx)
#   stop      - Stop all services
#   migrate   - Run database migrations
#   logs      - View logs
#   clean     - Remove all containers and volumes
#   build     - Build all containers
#   help      - Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example .env
            echo -e "${GREEN}Created .env file. Please edit it with your configuration.${NC}"
        else
            echo -e "${RED}Error: .env.example not found. Please create .env manually.${NC}"
            exit 1
        fi
    fi
}

# Generate secret key if not set
generate_secret() {
    if grep -q "change-this-in-production-use-openssl-rand-hex-32" .env 2>/dev/null; then
        echo -e "${YELLOW}Generating new SECRET_KEY...${NC}"
        SECRET_KEY=$(openssl rand -hex 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/change-this-in-production-use-openssl-rand-hex-32/$SECRET_KEY/" .env
        else
            # Linux
            sed -i "s/change-this-in-production-use-openssl-rand-hex-32/$SECRET_KEY/" .env
        fi
        echo -e "${GREEN}Generated SECRET_KEY: ${SECRET_KEY:0:10}...${NC}"
    fi
}

# Start development environment
start_dev() {
    echo -e "${BLUE}Starting development environment...${NC}"
    check_env
    generate_secret

    # Build and start services
    docker-compose up --build -d mysql backend frontend

    echo -e "${GREEN}Development environment started!${NC}"
    echo ""
    echo -e "Services:"
    echo -e "  - Frontend: ${BLUE}http://localhost:5173${NC}"
    echo -e "  - Backend:  ${BLUE}http://localhost:8000${NC}"
    echo -e "  - API Docs: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "Run ${YELLOW}./deploy/deploy.sh migrate${NC} to initialize the database."
}

# Start production environment
start_prod() {
    echo -e "${BLUE}Starting production environment...${NC}"
    check_env
    generate_secret

    # Build frontend
    echo -e "${YELLOW}Building frontend...${NC}"
    npm run build

    # Build and start services with production profile
    docker-compose --profile production up --build -d mysql backend nginx

    echo -e "${GREEN}Production environment started!${NC}"
    echo ""
    echo -e "Services:"
    echo -e "  - Frontend: ${BLUE}http://localhost${NC}"
    echo -e "  - Backend:  ${BLUE}http://localhost:8000${NC}"
    echo -e "  - API Docs: ${BLUE}http://localhost:8000/docs${NC}"
}

# Stop all services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose --profile production down
    echo -e "${GREEN}All services stopped.${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}Running database migrations...${NC}"

    # Check if backend container is running
    if ! docker ps | grep -q chronoflow_backend; then
        echo -e "${YELLOW}Backend container not running. Starting it first...${NC}"
        docker-compose up -d mysql backend
        sleep 5
    fi

    # Run migrations inside the container
    docker-compose exec backend alembic upgrade head

    echo -e "${GREEN}Migrations completed.${NC}"
}

# View logs
view_logs() {
    local service=${1:-}
    if [ -n "$service" ]; then
        docker-compose logs -f "$service"
    else
        docker-compose logs -f
    fi
}

# Clean up
clean_up() {
    echo -e "${RED}This will remove all containers, volumes, and data!${NC}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose --profile production down -v --rmi local
        echo -e "${GREEN}Cleanup completed.${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

# Build containers
build_containers() {
    echo -e "${BLUE}Building containers...${NC}"
    docker-compose --profile production build
    echo -e "${GREEN}Build completed.${NC}"
}

# Show help
show_help() {
    echo "ChronoFlow Deployment Script"
    echo ""
    echo "Usage: ./deploy/deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev       Start development environment (MySQL + Backend + Frontend)"
    echo "  prod      Start production environment (MySQL + Backend + Nginx)"
    echo "  stop      Stop all services"
    echo "  migrate   Run database migrations"
    echo "  logs      View logs (optional: specify service name)"
    echo "  clean     Remove all containers and volumes"
    echo "  build     Build all containers"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy/deploy.sh dev"
    echo "  ./deploy/deploy.sh migrate"
    echo "  ./deploy/deploy.sh logs backend"
}

# Main command dispatcher
case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    stop)
        stop_services
        ;;
    migrate)
        run_migrations
        ;;
    logs)
        view_logs "$2"
        ;;
    clean)
        clean_up
        ;;
    build)
        build_containers
        ;;
    help|*)
        show_help
        ;;
esac
