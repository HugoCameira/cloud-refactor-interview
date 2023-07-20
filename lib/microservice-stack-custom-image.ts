// https://github.com/aws/constructs/blob/10.x/API.md#constructs-construct
import {type Construct} from 'constructs'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html
import * as cdk from 'aws-cdk-lib'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs-readme.html
import * as ecs from 'aws-cdk-lib/aws-ecs'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2-readme.html
import * as ec2 from 'aws-cdk-lib/aws-ec2'
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_elasticloadbalancingv2-readme.html
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {TargetType} from 'aws-cdk-lib/aws-elasticloadbalancingv2'

interface MicroserviceProps extends cdk.StackProps {
  serviceName: string
  pathToImage: string
  //HTTP Method
  methodType: string,
  //Path after the domain-name
  path: string,
  //What is returned by the service if illegal request
  serviceResponseFaillure: string
}

export class MicroServiceCustomImageStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: MicroserviceProps) {
    super(scope, id, props)

    const vpc = this.addVpc()
    const cluster = this.addEcsCluster(vpc)
    const lb = this.addLoadBalancer(vpc)
    this.addServer(cluster, vpc, lb, props)

    new cdk.CfnOutput(this, 'lb-endpoint', {
      value: lb.loadBalancerDnsName,
      description: 'service endpoint'
    })
  }

  private addServer (cluster: ecs.Cluster, vpc: ec2.Vpc, lb: elb.ApplicationLoadBalancer, props: MicroserviceProps): void {
    const taskDefinition = new ecs.TaskDefinition(this, 'api', {
      cpu: '512',
      compatibility: ecs.Compatibility.EC2
    })

    taskDefinition.addContainer(`${props.serviceName}-server`, {
      image: ecs.ContainerImage.fromAsset(props.pathToImage),
      portMappings: [{
        containerPort: 80,
        hostPort: 80
      }],
      memoryLimitMiB: 256,
      essential: true
    })

    const service = new ecs.Ec2Service(this, 'service', {
      cluster,
      taskDefinition
    })

    const applicationTargetGroup = new elb.ApplicationTargetGroup(this, 'app-target-group', {
      vpc,
      port: 25111,
      targetType: TargetType.INSTANCE,
      protocol: elb.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/health', // Specify the health check endpoint path
        interval: cdk.Duration.seconds(30), // Health check interval
        timeout: cdk.Duration.seconds(5), // Health check timeout
        healthyThresholdCount: 2, // Number of consecutive successful health checks to consider the target healthy
        unhealthyThresholdCount: 2, // Number of consecutive failed health checks to consider the target unhealthy
      },
    })
    service.attachToApplicationTargetGroup(applicationTargetGroup)

    const applicationListener = lb.addListener('app', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      defaultAction: elb.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: `${props.serviceResponseFaillure}`
      })
    })
    applicationListener.addAction(props.serviceName, {
      priority: 5,
      conditions: [
        elb.ListenerCondition.pathPatterns([`/${props.path}/*`]),
        elb.ListenerCondition.httpRequestMethods(
          [`${props.methodType}`]
        )],
      action: elb.ListenerAction.forward([applicationTargetGroup])
    })
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

  private addEcsCluster (vpc: ec2.Vpc): ecs.Cluster {
    const cluster = new ecs.Cluster(this, 'cluster', {
      vpc,
      capacity: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        maxCapacity: 2,
        minCapacity: 2,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
          onePerAz: true
        }
      }
    })
    return cluster
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
