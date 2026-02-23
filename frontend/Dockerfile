FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose CRA port
EXPOSE 3000

# Start CRA dev server
CMD ["npm", "start"]
