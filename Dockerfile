FROM node:22-alpine

WORKDIR /app

# Copy package files first and install dependencies
COPY package*.json ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Install the necessary packages
RUN apk update && apk add --no-cache python3 py3-pip alpine-sdk openssl-dev build-base python3-dev \
    && python3 -m pip install setuptools --break-system-packages

# Copy configuration file
RUN cp -n config.example.toml config.toml 

# Build the application
RUN pnpm run build

# Expose the application port
EXPOSE 8080

# Set entrypoint and command
ENTRYPOINT ["pnpm"]
CMD ["start", "--color"]
