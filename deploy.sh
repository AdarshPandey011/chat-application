#!/bin/bash

# ChatApp Deployment Script
# This script helps deploy the ChatApp to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Please update the .env file with your configuration"
        else
            log_error ".env.example file not found. Please create a .env file manually."
            exit 1
        fi
    fi
}

# Build and start development environment
start_dev() {
    log_info "Starting development environment..."
    
    check_docker
    check_env_file
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm run install:all
    
    # Start services
    log_info "Starting services with Docker Compose..."
    docker-compose up -d postgres redis kafka zookeeper
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Run database migrations
    log_info "Running database migrations..."
    cd services/auth-service
    npm run prisma:migrate
    cd ../..
    
    # Start all services
    log_info "Starting all services..."
    npm run dev
    
    log_success "Development environment started successfully!"
    log_info "Frontend: http://localhost:3000"
    log_info "GraphQL Playground: http://localhost:4000/graphql"
}

# Build and start production environment
start_prod() {
    log_info "Starting production environment..."
    
    check_docker
    check_env_file
    
    # Build production images
    log_info "Building production images..."
    docker-compose -f docker-compose.prod.yml build
    
    # Start services
    log_info "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 15
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec auth-service npx prisma migrate deploy
    
    log_success "Production environment started successfully!"
    log_info "Application: http://localhost"
}

# Stop all services
stop() {
    log_info "Stopping all services..."
    
    # Stop development services
    docker-compose down 2>/dev/null || true
    
    # Stop production services
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    log_success "All services stopped"
}

# Clean up everything
cleanup() {
    log_info "Cleaning up..."
    
    # Stop services
    stop
    
    # Remove containers and volumes
    docker-compose down -v --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
    
    # Remove images
    docker system prune -f
    
    log_success "Cleanup completed"
}

# Show logs
logs() {
    local service=${1:-""}
    
    if [ -n "$service" ]; then
        log_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        log_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Health check
health() {
    log_info "Checking service health..."
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running"
        
        # Check individual services
        services=("frontend:3000" "api-gateway:4000" "auth-service:3001" "chat-service:3002")
        
        for service in "${services[@]}"; do
            IFS=':' read -r name port <<< "$service"
            if curl -s "http://localhost:$port/health" > /dev/null; then
                log_success "$name is healthy"
            else
                log_error "$name is not responding"
            fi
        done
    else
        log_error "Services are not running"
        exit 1
    fi
}

# Show help
show_help() {
    echo "ChatApp Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs [svc]  Show logs (optionally for specific service)"
    echo "  health      Check service health"
    echo "  cleanup     Clean up everything (containers, volumes, images)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Start development environment"
    echo "  $0 prod             # Start production environment"
    echo "  $0 logs frontend    # Show logs for frontend service"
    echo "  $0 health           # Check service health"
}

# Main script
case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$2"
        ;;
    health)
        health
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
