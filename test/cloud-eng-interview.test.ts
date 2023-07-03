import * as cdk from 'aws-cdk-lib';
import { Match, Template} from 'aws-cdk-lib/assertions';
import * as CloudEngInterview from '../lib/microservice-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cloud-eng-interview-stack.ts

describe('Initial test suit', ()=>{

  let template: Template;

  beforeAll(()=> {
    const testApp = new cdk.App({
      outdir: 'cdk.out'
    });
    const stack = new CloudEngInterview.MicroServiceStack(testApp, 'MyTestStack',{
      serviceName: 'burrito',
      methodType: 'POST',
      path: 'wrapped',
      serviceResponseSuccess: 'This burrito is awesome!',
      serviceResponseFaillure: 'Burrito not found :(',
      env:{
          region: 'eu-west-3'
      }
    });
    template = Template.fromStack(stack);
  })

  // Check if configurations are properly configured 
  test('Check path configuration', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::ListenerRule', {
      Conditions: [
        {
         Field: "path-pattern",
         PathPatternConfig: {
          Values: [
           "/wrapped/*"
          ]
         }
        },
        {
         Field: "http-request-method",
         HttpRequestMethodConfig: {
          Values: [
           "POST"
          ]
         }
        }
       ]
    });
  });

  test('Test if ECS cluster is present', ()=>{
      template.hasResource('AWS::ECS::Cluster',{})
  });

  test('Test if LB is present', ()=>{
    template.hasResource('AWS::ElasticLoadBalancingV2::LoadBalancer',{})
  });

  // Check if VPC changes with snapshot
  test('VPC snapshot', ()=>{
    const vpc = template.findResources('AWS::EC2::VPC')
    expect(vpc).toMatchSnapshot();
  });
})