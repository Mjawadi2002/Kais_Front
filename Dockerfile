# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
# Using npm install instead of npm ci to handle version conflicts
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Install serve to serve the static files
RUN npm install -g serve

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]