# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
# Use --legacy-peer-deps to avoid ERESOLVE peer dependency failures during the build
# (Alternative: pin TypeScript to a v4.x in package.json to satisfy react-scripts@5)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Remove dev dependencies after build
# Use --legacy-peer-deps to avoid the same ERESOLVE conflicts during pruning
RUN npm prune --omit=dev --legacy-peer-deps

# Expose the port the app runs on
EXPOSE 3000

# Install serve to serve the static files
RUN npm install -g serve

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]