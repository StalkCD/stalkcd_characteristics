# stalkcd_characteristics

####
Working Docker command
docker build -t stalkcd/characteristics:latest .

Command to open mongodb shell in cli when run in docker container
docker exec -it CONTAINER_ID mongosh --username user --authenticationDatabase admin --password pass
to know containerid in cli: docker container ls