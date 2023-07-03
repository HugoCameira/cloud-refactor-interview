#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MicroServiceStack } from '../lib/microservice-stack';

const app = new cdk.App();
new MicroServiceStack(app, 'taco-service', {
    serviceName: 'taco',
    methodType: 'GET',
    path: 'folded',
    serviceResponseSuccess: 'Tacos are the best',
    serviceResponseFaillure: 'Taco not found',
    env:{
        region: 'eu-west-3'
    }
});

new MicroServiceStack(app, 'burrito-service', {
    serviceName: 'burrito',
    methodType: 'POST',
    path: 'wrapped',
    serviceResponseSuccess: 'This burrito is awesome!',
    serviceResponseFaillure: 'Burrito not found :(',
    env:{
        region: 'eu-west-3'
    }
});