# frontend/Dockerfile

# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the React app for production
# For Create React App, use `npm run build`
# For Vite, use `npm run build` (which typically builds to `dist/`)
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine as production

# Copy the built React app from the build stage to Nginx's html directory
# For Vite, it's usually /app/dist
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration (optional, but good for custom setups)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
