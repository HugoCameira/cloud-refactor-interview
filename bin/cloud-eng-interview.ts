#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MicroServiceStack } from '../lib/microservice-stack';
import { MicroServiceCustomImageStack } from '../lib/microservice-stack-custom-image';
import { MicroServiceStackVpcLb } from '../lib/microservice-vpc-lb';
import path from 'path';

const app = new cdk.App();
const stack = new MicroServiceCustomImageStack(app, 'MyCustomImageStack', {
    serviceName: 'burrito',
    pathToImage: path.join(__dirname, '..', 'services'),
    path: 'wrapped',
    methodType: 'POST',
    serviceResponseFaillure: 'Burrito not found.',
    env: {
      region: 'eu-west-3',
    },
  });

const vpclbstack = new MicroServiceStackVpcLb(app, 'VpcLbStack');

new MicroServiceStack(app, 'burrito-service', {
    serviceName: 'burrito',
    methodType: 'POST',
    path: 'wrapped',
    serviceResponseSuccess: 'This burrito is awesome!',
    serviceResponseFaillure: 'Burrito not found :(',
    env:{
        region: 'eu-west-3'
    }
}, vpclbstack.lb, vpclbstack.vpc);
