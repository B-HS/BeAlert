#!/bin/bash

cat <<EOF > Dockerfile
# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the working directory
COPY api-server/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY api-server/ .

# Expose the port that the app runs on
EXPOSE 8000

# Command to run the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

IMAGE_NAME=bealert-back
CONTAINER_NAME=bealert-back

docker build -t $IMAGE_NAME .

docker run -d -p 30003:8000 --name $CONTAINER_NAME $IMAGE_NAME