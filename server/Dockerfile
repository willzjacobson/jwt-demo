# Start with a base image of Alpine Linux with Node 8.11.1 installed (small)
FROM node:8.11.1-alpine

# Metadata
LABEL maintainer="technology@currencycap.com"

# Set working directory of container
WORKDIR /usr/src/app

# Copying source code into the working directory of the container
COPY . .

# Install dependencies (this happens in an intermdiate container)
RUN npm i

# expose TCP port
EXPOSE 80

# Command to start container
CMD ["npm", "start"]
