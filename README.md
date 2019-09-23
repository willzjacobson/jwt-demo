docker build -t willzj/single_test:latest .
  docker images
  docker history
docker image remove willzj/single_test:latest

docker run -p 3000:3000 -e COLOR=blue --name blue willzj/single_test:latest
docker run --rm -d -p 3000:3000 -e COLOR=blue --name blue willzj/single_test:latest
  docker ps
  docker inspect

docker run --rm -d -p 3001:3000 -e COLOR=pink --name green willzj/single_test:latest
  Inspect. Look at network config.
  Enter one. Ping the other. Point: it's like microservices

docker run --rm -d -p 3000:3000 -v $(pwd):/usr/src/app -e COLOR=pink -w "/usr/src/app" node:8.11.1-alpine npm run dev

docker-compose up -d
  poke around frontend
  enter frontend and ping backend by name
  list networks, inspect new one
docker-compose down