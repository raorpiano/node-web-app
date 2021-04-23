# node-web-app

Apps Transformation

Containerization

Docker

Docker allows you to package an application with its environment and all of its dependencies into a
"box", called a container. Usually, a container consists of an application running in a stripped-to-basics version of a Linux operating system. An image is the blueprint for a container, a container is a running instance of an image.

Example: Dockerizing a Node.js web app

Requirements:
1.	docker
2.	node
3.	npm

The goal of this example is to show you how to get a Node.js application into a Docker container. The guide is intended for development, and *not* for a production deployment. The guide also assumes you have a working [Docker installation] (https://docs.docker.com/engine/installation/) and a basic
understanding of how a Node.js application is structured.

## Create the Node.js app

First, create a new directory where all the files would live. In this directory
create a `package.json` file that describes your app and its dependencies:

```json
{
  "name": "docker_web_app",
  "version": "1.0.0",
  "description": "Node.js on Docker",
  "author": "First Last <first.last@example.com>",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.16.1"
  }
}
```

With your new `package.json` file, run `npm install`. If you are using `npm`
version 5 or later, this will generate a `package-lock.json` file which will be copied
to your Docker image.

Then, create a `server.js` file that defines a web app using the
[Express.js](https://expressjs.com/) framework:

'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const YEAR = process.env.YEAR || 2019;

// App
const app = express();
app.get('/', (req, res) => {
  res.send(`This app runs on container. Last run on ${YEAR}`);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);```


Now let’s run the server to check if our app works as intended. Type npm start and you should get the following log.

Running on http://0.0.0.0:8080

In the next steps, we'll look at how you can run this app inside a Docker
container using the official Docker image. First, you'll need to build a Docker
image of your app.

## Creating a Dockerfile

Create an empty file called `Dockerfile`:

# touch Dockerfile

Open the `Dockerfile` in your favorite text editor

The first thing we need to do is define from what image we want to build from.
Here we will use the latest LTS (long term support) version `14` of `node`
available from the [Docker Hub](https://hub.docker.com/_/node):

```docker
FROM node:14
```

Next we create a directory to hold the application code inside the image, this
will be the working directory for your application:

```docker
# Create app directory
WORKDIR /usr/src/app
```

This image comes with Node.js and NPM already installed so the next thing we
need to do is to install your app dependencies using the `npm` binary. Please
note that if you are using `npm` version 4 or earlier a `package-lock.json`
file will *not* be generated.

```docker
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
```

Note that, rather than copying the entire working directory, we are only copying
the `package.json` file. This allows us to take advantage of cached Docker
layers. bitJudo has a good explanation of this
[here](http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/).
Furthermore, the `npm ci` command, specified in the comments, helps provide faster, reliable, reproducible builds for production environments.
You can read more about this [here](https://blog.npmjs.org/post/171556855892/introducing-npm-ci-for-faster-more-reliable).

To bundle your app's source code inside the Docker image, use the `COPY`
instruction:

```docker
# Bundle app source
COPY . .
```

Your app binds to port `8080` so you'll use the `EXPOSE` instruction to have it
mapped by the `docker` daemon:

```docker
EXPOSE 8080
```

Last but not least, define the command to run your app using `CMD` which defines
your runtime. Here we will use `node server.js` to start your server:

```docker
CMD [ "node", "server.js" ]
```

Your `Dockerfile` should now look like this:

```docker
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
```

## .dockerignore file

Create a `.dockerignore` file in the same directory as your `Dockerfile`
with following content:

```
node_modules
npm-debug.log
```

This will prevent your local modules and debug logs from being copied onto your
Docker image and possibly overwriting modules installed within your image.

## Building your image

Go to the directory that has your `Dockerfile` and run the following command to
build the Docker image. The `-t` flag lets you tag your image so it's easier to
find later using the `docker images` command:


docker build . -t <your username>/node-web-app

# docker build . -t raorpiano/node-web-app

Your image will now be listed by Docker:

```bash
$ docker images

# Example
REPOSITORY                      TAG        ID              CREATED
node                            14         1934b0b038d1    5 days ago
<your username>/node-web-app    latest     d64d3505b0d2    1 minute ago
```

## Run the image

Running your image with `-d` runs the container in detached mode, leaving the
container running in the background. The `-p` flag redirects a public port to a
private port inside the container. Run the image you previously built:

docker run -p 80:8080 -d <your username>/node-web-app

# docker run -p 80:8080 -d raorpiano/node-web-app

Print the output of your app:

```bash
# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>

# Example
Running on http://localhost
```

If you need to go inside the container you can use the `exec` command:

```bash
# Enter the container
$ docker exec -it <container id> /bin/bash
```

## Test

To test your app, get the port of your app that Docker mapped:

```bash
$ docker ps

# Example
ID            IMAGE                                COMMAND    ...   PORTS
ecce33b30ebf  <your username>/node-web-app:latest  npm start  ...   0->8080
```

In the example above, Docker mapped the `8080` port inside of the container to
the port `80` on your machine.

Now you can call your app using `curl` (install if needed via: `sudo apt-get
install curl`):

$ curl -i localhost

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 27
ETag: W/"1b-btbQXI/4/3dSvwdLVn7rIQXGqsQ"
Date: Fri, 23 Apr 2021 07:02:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

This app runs on container 



 
Kubernetes

Kubernetes is an open-source container-orchestration system for automating computer application deployment, scaling, and management. It was originally designed by Google and is now maintained by the Cloud Native Computing Foundation.

Deploying our NodeJS app in Minikube

Requirements:

1.	minikube 
Minikube is a tool to learn and develop Kubernetes locally.

2.	kubectl
Kubectl is a command-line tool that allows you to control the Kubernetes cluster.

Start the minikube

# minikube start

Note: If all successful, you will see the following message at the end of the console.

Done! Kubectl is now configured to use “minikube” cluster and “default” namespace by default


Deployment

In Kubernetes a Pod is an instance of a running container. Node or a Worker machine in Kubernetes cluster will contain one or many pods. In order to create a pod(s), we can use a deployment object defined via a .yaml file.

Let’s create a deployment.yaml file for our previous nodeJS app.


apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-web-app-deployment
spec:
  selector:
    matchLabels:
      app: web-app
  replicas: 2
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: node-web-app
          image: node-web-app
          ports:
            - containerPort: 8080



Fields in the .yaml file have the following meanings.
- apiVersion indicated which API version used to create this object.
- kind is the type of Object to be created.
- metadata.name is the name given to the created object.
- spec.replicas is the number of replicated Pods . We have specified 2.
- spec.selector is a way for deployments to find the Pods . We have given app: web-app label.
- spec.template with its subfields is a way to specify the pod and container information.
- template.labels.app specified the label of the pod, here it is web-app template.spec.containers is an array that allows you to specify which image(s) needed by a pod and ports it will be exposing. We have specified the image we have created node-web-app image which exposes port 8080.

Now to create Pods run the following command.

$ kubectl apply -f deployment.yaml
# deployment.apps/node-web-app-deployment configured

Now if you run the below command. You should see two pods.

$ kubectl get pod

If you look really close at STATUS of each pod, they might be something like ErrImagePull or ImagePullBackOff and if you run one of the k8’s debug commands like logs or describe pod.

$ kubectl logs <pod_name>
# Error from server (BadRequest): container "node-web-app" in pod "<pod_name>" is waiting to start: trying and failing to pull image

It is failing to pull the image. 

As you might have guessed, the docker daemon in the cluster (MiniKube runs in a separate Docker container or a VM) is trying to find an image that does not exist. We only created the image in the above steps for the logged-in user. So we need to create the same image inside the Kubernetes cluster.

Go to node-web-app folder again and run the following commands.
$ eval $(minikube docker-env)

$ docker build -t node-web-app .
# Additionally you can check to see if node-web-app Docker image is in minikube by

$ minikube ssh

docker@minikube:~$ docker images
# You should see starward-node docker image

In the deployment.yaml add the following line

ports:
-	containerPort: 8080
imagePullPolicy: Never # Image should not be pulled

We need to start over. Let’s delete the existing deployment and re-run the pod creation. 

$ kubectl get deployment
# You’ll see node-web-app-deployment

$ kubectl delete deployment node-web-app-deployment
# deployment.apps “node-web-app-deployment” deleted

$ kubectl get deployment
# You should not see node-web-app-deployment

$ kubectl apply -f deployment.yaml
# deployment.apps/node-web-app-deployment created

$ kubectl get pod
# You should see two pods in “Running” STATUS

Now we have two pods running. Now what?


Service

Now we need to connect to these pods. Each pod has an associated IP address, but if we attempt to use these IPs to connect, it will become unmanageable when the number of Worker machines and prods increases. Here is where the concept of Service comes. It is an abstraction to access Pods without relying on lower-level details like IP addresses.

Note: Read https://kubernetes.io/docs/concepts/services-networking/service/ to learn more on Service

In the kubernestes-test folder create another file service.yaml with the following content

apiVersion: v1
kind: Service
metadata:
  name: node-web-app-service
spec:
  selector:
    app: node-web-app
  type: LoadBalancer
  ports:
    - protocol: TCP
      port: 8080
      targetPort:8080
      nodePort: 30080

For the kind Service apiVersion should be v1

metadata.name is the name for the service. It is important to note that  spec.selector.app is the exact label we gave for Pods we created above. By the above service, we are giving access to targetPort: 8080 which is the containerPort of each Pod. Also, note that this service has exposed port: 8080 .

By setting type: LoadBalancer we are stating this service as an external service with an external IP address. The nodePort: 30080 is the port that can be used to access this service using the external IP. (note that there is a range for the nodePort between 30000–32767)

Now run the following commands,

$ kubectl apply -f service.yaml
# service/node-web-app-service created

$ kubectl get service
# Observe that service created

$ minikube service node-web-app-service --url
# http://<external_service_ip>:30080



ConfigMap

If you remember, we defined an environment variable YEAR in the Node server. I added this with a purpose. The reason being, introducing the idea of ConfigMap; another Object type in Kubernetes. A ConfigMap can be used to handle ENVs related to a container.

Let’s add another file envs.yaml in the node-web-app folder with the content.

apiVersion: v1
kind: ConfigMap
metadata:
  name: sw-envs
data:
  currentYear: “2021”

Just as above we have defined apiVersion, kind and metadata attributed. The data field contains the ENVs we need to inject into the containers.

Now there should be a way to inject this ENV to the node . It is done by adding container.env field in the deployment.yaml . Add the env section to the .yaml file.
...
          ports:
            - containerPort: 8080
          imagePullPolicy: Never
          env:
            - name: YEAR
              valueFrom:
                configMapKeyRef:
                  name: sw-envs
                  key: currentYear

ConfigMap has to create first, therefore run the following commands

$ kubectl apply -f envs.yaml

$ kubectl apply -f deployment.yaml

Now curl http://<external_service_ip>:30080 

and see that you now it last run on 2021.
 
Reference

* [Official Node.js Docker Image](https://hub.docker.com/_/node/)
* [Node.js Docker Best Practices Guide](https://github.com/nodejs/dockernode/blob/master/docs/BestPractices.md)
* [Official Docker documentation](https://docs.docker.com/get-started/nodejs/build-images/)
* [Docker Tag on Stack Overflow](https://stackoverflow.com/questions/tagged/docker)
* [Docker Subreddit](https://reddit.com/r/docker)



![image](https://user-images.githubusercontent.com/11093335/115852686-ecb18180-a45a-11eb-9448-5b22c11083fa.png)
