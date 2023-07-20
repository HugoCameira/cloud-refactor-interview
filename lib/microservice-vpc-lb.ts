// https://github.com/aws/constructs/blob/10.x/API.md#constructs-construct
import {type Construct} from 'constructs'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_elasticloadbalancingv2-readme.html
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2-readme.html
import * as ec2 from 'aws-cdk-lib/aws-ec2'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html
import * as cdk from 'aws-cdk-lib'


export class MicroServiceStackVpcLb extends cdk.Stack {

    public lb: elb.ApplicationLoadBalancer
    public vpc: ec2.Vpc
    
    constructor (scope: Construct, id: string) {
      super(scope, id, {})
      
      this.vpc = this.addVpc()
      this.lb = this.addLoadBalancer(this.vpc)
    }

    private addLoadBalancer (vpc: ec2.Vpc): elb.ApplicationLoadBalancer {
        const lb = new elb.ApplicationLoadBalancer(this, 'LB', {
          vpc,
          internetFacing: true,
          vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC
          }
        })
        return lb
      }

    private addVpc (): ec2.Vpc {
        const vpc = new ec2.Vpc(this, 'vpc', {
          maxAzs: 3,
          subnetConfiguration: [
            {
              subnetType: ec2.SubnetType.PUBLIC,
              name: 'public'
            }
          ],
          natGateways: 0 // https://www.lastweekinaws.com/blog/the-aws-managed-nat-gateway-is-unpleasant-and-not-recommended/ :)
        })
        return vpc
      }
}


