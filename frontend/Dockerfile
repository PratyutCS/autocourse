FROM oven/bun:1

WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN bun install

# Copy the rest of the application code.
COPY . .

# Build the application using the "build" script from package.json.
RUN bun run build

# Add the "serve" package.
RUN bun add serve

# Set environment variable and expose the port.
ENV PORT=3001
EXPOSE 3001

# Serve static files from the "dist" directory.
CMD ["bun", "serve", "-s", "dist"]