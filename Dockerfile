# Use node:20-slim as the base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5173 (default Vite port)
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "dev", "--", "--host"]
