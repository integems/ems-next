#!/bin/bash

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "Docker does not seem to be running, start Docker and try again"
        exit 1
    fi
}

# Function to start containers and wait for database
start_containers() {
    echo "Starting environment..."
    docker compose -f docker-compose.yml up -d postgres
    # Wait for dev database to be ready
    until docker exec ems_db pg_isready; do
        echo "Waiting for database..."
        sleep 2
    done
}

# Function to run migrations and push changes
setup_environment() {
    echo "Seeding database..."
    npm run seed || {
        echo "Seeding failed (possibly due to existing data), continuing..."
    }
}

# Main script
 main(){
    check_docker
    start_containers
    # setup_environment 
    echo "Development environment is ready!"
 }

 main