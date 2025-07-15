# Use Node.js 18 Alpine for production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy pre-built application
COPY dist ./dist
COPY client/build ./client/build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/server.js"]