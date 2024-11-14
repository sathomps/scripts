#!/bin/bash

# Check if service name is provided
if [ -z "$1" ]; then
    echo "Please provide a service name as an argument"
    echo "Usage: $0 <service-name>"
    exit 1
fi

SERVICE_NAME=$1
echo "Starting Docker Swarm cleanup for service: $SERVICE_NAME..."

# Remove specific service if it exists
if docker service ls -q --filter name=$SERVICE_NAME | grep -q .; then
    echo "Removing service $SERVICE_NAME..."
    docker service rm $SERVICE_NAME
else
    echo "No service found with name: $SERVICE_NAME"
fi

# Remove networks associated with the service
if docker network ls -q -f "label=com.docker.swarm.scope=swarm" --filter label=com.docker.stack.namespace=$SERVICE_NAME | grep -q .; then
    echo "Removing networks for $SERVICE_NAME..."
    docker network rm $(docker network ls -q -f "label=com.docker.swarm.scope=swarm" --filter label=com.docker.stack.namespace=$SERVICE_NAME)
else
    echo "No swarm networks found for $SERVICE_NAME"
fi

# Remove configs associated with the service
if docker config ls -q --filter name=$SERVICE_NAME | grep -q .; then
    echo "Removing configs for $SERVICE_NAME..."
    docker config rm $(docker config ls -q --filter name=$SERVICE_NAME)
else
    echo "No configs found for $SERVICE_NAME"
fi

# Remove secrets associated with the service
if docker secret ls -q --filter name=$SERVICE_NAME | grep -q .; then
    echo "Removing secrets for $SERVICE_NAME..."
    docker secret rm $(docker secret ls -q --filter name=$SERVICE_NAME)
else
    echo "No secrets found for $SERVICE_NAME"
fi

# Remove volumes associated with the service
if docker volume ls -q --filter name=$SERVICE_NAME | grep -q .; then
    echo "Removing volumes for $SERVICE_NAME..."
    docker volume rm $(docker volume ls -q --filter name=$SERVICE_NAME)
else
    echo "No volumes found for $SERVICE_NAME"
fi

echo "Cleanup for service $SERVICE_NAME completed successfully!"
