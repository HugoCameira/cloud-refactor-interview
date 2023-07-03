# Infrastructure refactoring

Welcome to the Cloud Engineering technical interview. The purpose of this exercise is to see how you would approach refactoring an existing piece of code that manages AWS infrastructure based on the requirments we're setting out in the brief. As general guidance, you're not expected to spend more than an hour on this.

This exercise is designed to only require infrastructure that fits within the AWS Free Tier. This means that if you want to, you can try this out live in order to validate your solution. However, the purpose of the exercise is to understand how you would approach solving the brief. The solution doesn't have to be 100% correct and validated to work in AWS as long as your general approach makes sense.

## Prep & info

In this exercise you'll be using AWS Cloud Development Kit and its Typescript bindings to create some infrastructure in AWS. If you're familiar with tools like Terraform then CDK should feel familiar, except that you're using a general purpose programming language instead of a DSL. For a short introduction to the general concepts of CDK as well as some example code, you can read the [What is the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) chapter of the documentation.

It's stronly recommended to set up your editor with a Typescript language server so your editor can assist in the refactoring, provide code completion etc. The code itself contains links to the reference documentation for each object that is used.

Before you get started ensure you have:
* NodeJS (>= 14) and npm installed
* Cloned this repository
* Ran `npm install`

If you also want to try out your solution in AWS:
* Configure the AWS CLI for your account
* Validate it works with `aws sts get-caller-identity`
* Deploy to AWS:
  ```shell
  npm run cdk -- bootstrap # only required if you never used CDK in the current AWS account and region
  npm run cdk -- deploy taco-service
  # after deploying CDK should display the `taco-service.lbendpoint`, which is the **domain-name**.
  curl --fail http://<domain-name>/folded/smoky-pulled-aubergine-black-bean
  ```

## Brief
The El Chiquito, a hyper-scaling Mexican start-up restaurant, serves Mexican dishes using HTTP requests. This repository contains the tacos microservice. It serves tacos in response to `GET` requests on the `folded` path.

The Tacos are a great success, and the company raised a Series A. It now wants to start serving 20 more Mexican dishes!

We'd like you to go in and refactor the current taco service. We would like to end up with a reusable component that teams can use to deploy their own microservices. With that refactoring done, you should add the new Burrito service that serves Burritos on `POST` requests to the `/wrapped` path.

### Submission

You can push your solution to a public repository of your chosing and tell us where to go and get it from.

### Criteria
* Your solution should create a generic service that each team can use for their dish
* The solution should allow for enough configurability to avoid teams copy-pasting the service abstraction or cloning the existing TacoService
* Each microservice should have its own ECS cluster and load balancer
* (Optional) Write a test

In the end, the solution should roughly work like this:
```shell
npm run cdk -- deploy taco-service # Still deploys a functioning Tacos service
npm run cdk -- deploy burrito-service # Deploys a Burrito service
curl --fail -X POST http://<burrito-service-domain-name>/wrapped/fajita-veggies-salsa-roja
# The above should serve a Burrito
```

### Where to start

The entrypoint for any CDK application is in the `bin/` directory. It'll import CDK as well as our taco-service that lives in the `lib/` directory.

## Useful commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run cdk -- deploy`      deploy this stack to your default AWS account/region
* `npm run cdk -- diff`        compare deployed stack with current state
* `npm run cdk -- synth`       emits the synthesized CloudFormation template
