# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
# If package-lock.json is not committed, this will only copy package.json
COPY package*.json ./

# Install app dependencies
# Using --production flag installs only dependencies, not devDependencies
# For this project, since we don't have devDependencies, `npm ci` or `npm install` would also work.
# `npm ci` is often preferred for reproducible builds if package-lock.json is present.
RUN npm install --production

# Bundle app source inside Docker image
COPY . .

# Make port available to the world outside this container.
# The server listens on process.env.PORT || 3000.
# Platforms like Cloud Run will set PORT. If running manually, you'd map it.
EXPOSE 3000
# This EXPOSE is documentation; the app still needs to listen on the $PORT variable.

# Define environment variable (can be overridden at runtime)
ENV NODE_ENV production

# Command to run the application using the start script from package.json
CMD [ "npm", "start" ]
