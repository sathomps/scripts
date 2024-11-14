#!/bin/bash

# List all running containers with numbers
echo "Running containers:"
echo "------------------"
containers=($(docker ps --format '{{.Names}}'))
if [ ${#containers[@]} -eq 0 ]; then
    echo "No running containers found"
    exit 1
fi

# Display containers with numbers
for i in "${!containers[@]}"; do
    echo "[$((i+1))] ${containers[$i]}"
done

# Get user selection
echo -n "Select container number to cleanup (1-${#containers[@]}): "
read selection

# Validate input
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#containers[@]} ]; then
    echo "Invalid selection. Please enter a number between 1 and ${#containers[@]}"
    exit 1
fi

# Get selected container name
CONTAINER="${containers[$((selection-1))]}"
echo "Starting cleanup for container: $CONTAINER"

# Stop container
echo "Stopping container..."
if ! docker stop $CONTAINER; then
    echo "Error: Failed to stop container"
    exit 1
fi

# Remove container and associated volumes
echo "Removing container and associated resources..."
if ! docker rm -v $CONTAINER; then
    echo "Error: Failed to remove container"
    exit 1
fi

# Cleanup dangling resources
echo "Cleaning up dangling resources..."
docker image prune -f >/dev/null 2>&1
docker network prune -f >/dev/null 2>&1
docker volume prune -f >/dev/null 2>&1

echo "✨ Cleanup completed successfully"