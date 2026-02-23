FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 8000

# Start server
CMD ["node", "server.js"]
