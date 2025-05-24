// This is an AWS-SDK file that communicates with AWS services to manage EC2 instances, VPCs, and other resources. It includes functions for creating key pairs, checking existing infrastructure, creating new resources, and managing EC2 instances. The code uses the AWS SDK for JavaScript v3 and handles various AWS operations such as creating VPCs, subnets, security groups, and instances. It also includes error handling . . . 

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer'); // A library for interactive command-line user interfaces ( When Setting up the project )
const {
  EC2Client,
  CreateKeyPairCommand,
  CreateVpcCommand,
  CreateTagsCommand,
  CreateInternetGatewayCommand,
  AttachInternetGatewayCommand,
  CreateRouteTableCommand,
  DescribeInstanceTypeOfferingsCommand,
  CreateRouteCommand,
  CreateSubnetCommand,
  ModifySubnetAttributeCommand,
  AssociateRouteTableCommand,
  RebootInstancesCommand,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  DescribeVpcsCommand,
  TerminateInstancesCommand,
  StopInstancesCommand,
  DescribeInstancesCommand,
  StartInstancesCommand,
  DescribeSubnetsCommand,
  DescribeInternetGatewaysCommand,
  RunInstancesCommand,
  DescribeImagesCommand,
  DescribeRouteTablesCommand,
  DescribeSecurityGroupsCommand,
  waitUntilVpcAvailable,
} = require('@aws-sdk/client-ec2');
require('dotenv').config();
const { allowedAmis, allowedInstanceTypes, allowedSecurityGroups } = require('./resources');
const { stringify } = require('querystring');

// Below RESOURCE_TAGS used to identify resources created by the script or to create resources with these tags.
// These tags are named uniquely to avoid conflicts with user's other resources in the same AWS account.
const RESOURCE_TAGS = {
  VPC: 'project-pmWkWSBCL51Bfkhn79x-vpc',
  SUBNET: 'project-pmWkWSBCL51Bfkhn79x-subnet',
  SSH_SG: 'project-pmWkWSBCL51Bfkhn79x-ssh-sg',
  WEB_SG: 'project-pmWkWSBCL51Bfkhn79x-web-sg',
  RT: 'project-pmWkWSBCL51Bfkhn79x-rt',
  IGW: 'project-pmWkWSBCL51Bfkhn79x-igw',
};   

const CONFIG_PATH = path.resolve(__dirname, '../infra-config.json');

// Initialize the EC2 client with credentials and region from environment variables
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to create an EC2 key pair
async function createEC2KeyPair(keyName) {
  try {
    const command = new CreateKeyPairCommand({ KeyName: keyName });
    const response = await ec2Client.send(command);
    // console.log('Key Pair Created:', response);
    return response;
  } catch (error) {
    console.error('Error creating key pair:', error);
    throw error;
  }
}

// Helper function to validate the structure of the configuration file
async function validateConfigStructure(config) {
  return !!(
    config &&
    config.region &&
    config.vpcId &&
    config.subnetId &&
    config.igwId &&
    config.routeTableId &&
    Array.isArray(config.securityGroupIds) &&
    config.securityGroupIds.length === 2
  );
}


// Function to verify the existence of AWS resources based on the provided configuration
async function verifyAWSResources(config) {
  try {
    const [vpcData, subnetData, igwData, rtData, sgData] = await Promise.all([
      ec2Client.send(new DescribeVpcsCommand({ VpcIds: [config.vpcId] })),
      ec2Client.send(new DescribeSubnetsCommand({ SubnetIds: [config.subnetId] })),
      ec2Client.send(new DescribeInternetGatewaysCommand({ InternetGatewayIds: [config.igwId] })),
      ec2Client.send(new DescribeRouteTablesCommand({ RouteTableIds: [config.routeTableId] })),
      ec2Client.send(new DescribeSecurityGroupsCommand({ GroupIds: config.securityGroupIds })),
    ]);
    const exists =
      vpcData.Vpcs.length > 0 &&
      subnetData.Subnets.length > 0 &&
      igwData.InternetGateways.length > 0 &&
      rtData.RouteTables.length > 0 &&
      sgData.SecurityGroups.length === 2;
    return {
      validResources: exists,
      resources: exists
        ? {
            vpc: { id: vpcData.Vpcs[0].VpcId, name: RESOURCE_TAGS.VPC },
            subnet: { id: subnetData.Subnets[0].SubnetId, name: RESOURCE_TAGS.SUBNET },
            igw: { id: igwData.InternetGateways[0].InternetGatewayId, name: RESOURCE_TAGS.IGW },
            routeTable: { id: rtData.RouteTables[0].RouteTableId, name: RESOURCE_TAGS.RT },
            securityGroups: sgData.SecurityGroups.map((sg, idx) => ({
              id: sg.GroupId,
              name:
                config.securityGroupIds[idx] === sg.GroupId
                  ? [RESOURCE_TAGS.SSH_SG, RESOURCE_TAGS.WEB_SG][idx]
                  : sg.GroupName,
            })),
          }
        : undefined,
    };
  } catch (error) {
    return { validResources: false };
  }
}

// Function to check if any existing infrastructure is present or not before creating new resources
async function checkExistingInfrastructure() {
  try {
    const [vpcResponse, subnetResponse, sgResponse, rtResponse, igwResponse] = await Promise.all([
      ec2Client.send(
        new DescribeVpcsCommand({ Filters: [{ Name: 'tag:Name', Values: [RESOURCE_TAGS.VPC] }] })
      ),
      ec2Client.send(
        new DescribeSubnetsCommand({ Filters: [{ Name: 'tag:Name', Values: [RESOURCE_TAGS.SUBNET] }] })
      ),
      ec2Client.send(
        new DescribeSecurityGroupsCommand({ Filters: [{ Name: 'group-name', Values: [RESOURCE_TAGS.SSH_SG, RESOURCE_TAGS.WEB_SG] }] })
      ),
      ec2Client.send(
        new DescribeRouteTablesCommand({ Filters: [{ Name: 'tag:Name', Values: [RESOURCE_TAGS.RT] }] })
      ),
      ec2Client.send(
        new DescribeInternetGatewaysCommand({ Filters: [{ Name: 'tag:Name', Values: [RESOURCE_TAGS.IGW] }] })
      ),
    ]);
    return {
      exists:
        vpcResponse.Vpcs.length > 0 ||
        subnetResponse.Subnets.length > 0 ||
        sgResponse.SecurityGroups.length > 0 ||
        rtResponse.RouteTables.length > 0 ||
        igwResponse.InternetGateways.length > 0,
      resources: {
        vpcs: vpcResponse.Vpcs,
        subnets: subnetResponse.Subnets,
        securityGroups: sgResponse.SecurityGroups,
        routeTables: rtResponse.RouteTables,
        internetGateways: igwResponse.InternetGateways,
      },
    };
  } catch (error) {
    return { exists: false };
  }
}

// Function to handle the configuration file, validate its structure, and check AWS resources
async function handleConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    if (!(await validateConfigStructure(config))) {
      throw new Error('Invalid config structure');
    }
    const resourcesValid = await verifyAWSResources(config);
    if (!resourcesValid.validResources) {
      throw new Error('AWS resources validation failed');
    }
    return resourcesValid.resources;
  } catch (error) {
    console.log(`Config file issue: ${error.message}`);
    const { shouldDelete } = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldDelete',
      message: 'Delete invalid config file and continue?',
      default: false,
    });
    if (shouldDelete) {
      fs.unlinkSync(CONFIG_PATH);
      console.log('Config file deleted');
      return null;
    }
    console.log('Exiting due to invalid configuration');
    process.exit(1);
  }
}


// Helper function to return Availibility zones supporting an array of instanceTypes
async function getAZsSupportInstances(instanceTypes) {
  const command = new DescribeInstanceTypeOfferingsCommand({
    LocationType: "availability-zone",
    Filters: [
      {
        Name: "instance-type",
        Values: instanceTypes,
      },
    ],
  });
  const response = await ec2Client.send(command);

  // Build a map: AZ -> Set of instance types available there
  const azMap = {};
  for (const offering of response.InstanceTypeOfferings) {
    const az = offering.Location;
    const type = offering.InstanceType;
    if (!azMap[az]) azMap[az] = new Set();
    azMap[az].add(type);
  }

  // Filter the AZs that have *all* requested instance types
  const commonAZs = Object.entries(azMap)
    .filter(([az, typesSet]) =>
      instanceTypes.every(type => typesSet.has(type))
    )
    .map(([az]) => az);

  return commonAZs;
}



// Function to create the infrastructure (VPC, subnets, security groups, etc. when first time setting up the project) 
async function createInfrastructure() {


  const supportedAZs = await getAZsSupportInstances(allowedInstanceTypes);
  if( supportedAZs.length === 0 ) {
    console.log( `No Availability zone support all instance types ${ JSON.stringify(allowedInstanceTypes) } in REGION: ${process.env.AWS_REGION}. . . ` );
    console.log( `Please change region or check the instance types and region compatibility. . . ` );
    process.exit(1);
  }

  const prefixes = Array.from({ length: 28 - 16 + 1 }, (_, i) => 16 + i);
  const { prefix } = await inquirer.prompt({
    type: 'list',
    name: 'prefix',
    message: 'How many IP addresses do you require for the VPC? (10.0.0.0 fixed)',
    choices: prefixes.map((p) => ({ name: `${2 ** (32 - p)} IPs (/${p})`, value: p })),
  });
  const cidr = `10.0.0.0/${prefix}`;
  const { confirm } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Create VPC (${cidr}) in ${process.env.AWS_REGION} with public subnet and security groups?`,
    default: true,
  });
  if (!confirm) {
    console.log('Operation cancelled');
    process.exit(0);
  }
  const vpc = await ec2Client.send(new CreateVpcCommand({ CidrBlock: cidr }));
  await ec2Client.send(
    new CreateTagsCommand({ Resources: [vpc.Vpc.VpcId], Tags: [{ Key: 'Name', Value: RESOURCE_TAGS.VPC }] })
  );
  await waitUntilVpcAvailable({ client: ec2Client }, { VpcIds: [vpc.Vpc.VpcId] });
  const igw = await ec2Client.send(new CreateInternetGatewayCommand({}));
  await ec2Client.send(
    new AttachInternetGatewayCommand({ InternetGatewayId: igw.InternetGateway.InternetGatewayId, VpcId: vpc.Vpc.VpcId })
  );
  await ec2Client.send(
    new CreateTagsCommand({ Resources: [igw.InternetGateway.InternetGatewayId], Tags: [{ Key: 'Name', Value: RESOURCE_TAGS.IGW }] })
  );
  const rt = await ec2Client.send(new CreateRouteTableCommand({ VpcId: vpc.Vpc.VpcId }));
  await ec2Client.send(
    new CreateTagsCommand({ Resources: [rt.RouteTable.RouteTableId], Tags: [{ Key: 'Name', Value: RESOURCE_TAGS.RT }] })
  );
  await ec2Client.send(
    new CreateRouteCommand({ RouteTableId: rt.RouteTable.RouteTableId, DestinationCidrBlock: '0.0.0.0/0', GatewayId: igw.InternetGateway.InternetGatewayId })
  );
  const subnet = await ec2Client.send(
    new CreateSubnetCommand({ VpcId: vpc.Vpc.VpcId, CidrBlock: cidr,  AvailabilityZone: supportedAZs[0] })
  );
  await ec2Client.send(
    new ModifySubnetAttributeCommand({ SubnetId: subnet.Subnet.SubnetId, MapPublicIpOnLaunch: { Value: true } })
  );
  await ec2Client.send(
    new AssociateRouteTableCommand({ SubnetId: subnet.Subnet.SubnetId, RouteTableId: rt.RouteTable.RouteTableId })
  );
  await ec2Client.send(
    new CreateTagsCommand({ Resources: [subnet.Subnet.SubnetId], Tags: [{ Key: 'Name', Value: RESOURCE_TAGS.SUBNET }] })
  );
  const createSG = async (name, description, rules) => {
    const sg = await ec2Client.send(
      new CreateSecurityGroupCommand({ GroupName: name, Description: description, VpcId: vpc.Vpc.VpcId })
    );
    await ec2Client.send(
      new AuthorizeSecurityGroupIngressCommand({ GroupId: sg.GroupId, IpPermissions: rules })
    );
    return sg.GroupId;
  };
  const sshSGId = await createSG(RESOURCE_TAGS.SSH_SG, 'SSH access', [
    { IpProtocol: 'tcp', FromPort: 22, ToPort: 22, IpRanges: [{ CidrIp: '0.0.0.0/0' }] },
  ]);
  const webSGId = await createSG(RESOURCE_TAGS.WEB_SG, 'Web access', [
    { IpProtocol: 'tcp', FromPort: 80, ToPort: 80, IpRanges: [{ CidrIp: '0.0.0.0/0' }] },
    { IpProtocol: 'tcp', FromPort: 443, ToPort: 443, IpRanges: [{ CidrIp: '0.0.0.0/0' }] },
  ]);
  const resourceMap = {
    vpc: { id: vpc.Vpc.VpcId, name: RESOURCE_TAGS.VPC },
    subnet: { id: subnet.Subnet.SubnetId, name: RESOURCE_TAGS.SUBNET },
    igw: { id: igw.InternetGateway.InternetGatewayId, name: RESOURCE_TAGS.IGW },
    routeTable: { id: rt.RouteTable.RouteTableId, name: RESOURCE_TAGS.RT },
    securityGroups: [
      { id: sshSGId, name: RESOURCE_TAGS.SSH_SG },
      { id: webSGId, name: RESOURCE_TAGS.WEB_SG },
    ],
  };
  const config = {
    region: process.env.AWS_REGION,
    vpcId: resourceMap.vpc.id,
    subnetId: resourceMap.subnet.id,
    igwId: resourceMap.igw.id,
    routeTableId: resourceMap.routeTable.id,
    securityGroupIds: resourceMap.securityGroups.map((sg) => sg.id),
  };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('Infrastructure created and configuration saved');
  return resourceMap;
}


// Function to map AMI names to their respective AMI IDs and usernames ( Because AMI ID's change over time and region, and AWS requires these AMI ID's to launch instances )
async function mapAmiNamesToIds(amiNamesArray) {
  try {
    const describeImagesCmd = new DescribeImagesCommand({
      Filters: [{ Name: 'name', Values: amiNamesArray }],
      Owners: ['amazon', 'aws-marketplace', '099720109477', 'self'],
    });

    const result = await ec2Client.send(describeImagesCmd);
    const mapped = {};

    for (const image of result.Images) {
      const amiName = image.Name;
      const imageId = image.ImageId;

      let username;

      if (/ubuntu/i.test(amiName)) {
        username = 'ubuntu';
      } else if (/debian/i.test(amiName)) {
        username = 'admin';
      } else {
        // All other known cases like RHEL, SUSE, Amazon Linux, AL2023
        username = 'ec2-user';
      }

      mapped[amiName] = {
        imageId,
        username,
      };
    }

    //console.log('Mapped AMI Names to IDs and Usernames:\n', mapped);
    return mapped;
  } catch (err) {
    console.error('Error describing images:', err);
  }
}

// Function to create an EC2 instance with the specified parameters
async function createEC2Instance(instanceName, vpcId, subnetId, securityGroupIds, amiId, instanceType, keyName) {
  const params = {
    ImageId: amiId,
    InstanceType: instanceType,
    MinCount: 1,
    MaxCount: 1,
    KeyName: keyName,
    SecurityGroupIds: securityGroupIds,
    SubnetId: subnetId,
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: [{ Key: 'Name', Value: instanceName }],
      },
    ],
  };
  try {
    const command = new RunInstancesCommand(params);
    const response = await ec2Client.send(command);
    console.log('EC2 Instance Created:', response.Instances[0].InstanceId);
    return response.Instances[0];
  } catch (error) {
    console.error('Error creating EC2 instance:', error);
    throw error;
  }
}

// Function to get details of EC2 instances based on their IDs
async function getInstanceDetails(instanceIdArray) {
  const command = new DescribeInstancesCommand({ InstanceIds: instanceIdArray });
  try {
    const response = await ec2Client.send(command);
    return response;
  } catch (error) {
    console.error('Error fetching instance details:', error);
    throw error;
  }
}

// Function to start EC2 instances
async function startInstances(instanceIdArray) {
  const command = new StartInstancesCommand({ InstanceIds: instanceIdArray });
  try {
    const response = await ec2Client.send(command);
    console.log('Instances started:', response.StartingInstances);
    return response;
  } catch (error) {
    console.error('Error starting instances:', error);
    throw error;
  }
}

// Function to stop EC2 instances
async function stopInstances(instanceIdArray) {
  const command = new StopInstancesCommand({ InstanceIds: instanceIdArray });
  try {
    const response = await ec2Client.send(command);
    console.log('Instance stopped:', response.StoppingInstances);
    return response;
  } catch (error) {
    console.error('Error stopping instance:', error);
    throw error;
  }
}

// Function to reboot EC2 instances
async function rebootInstances(instanceIdArray) {
  const command = new RebootInstancesCommand({ InstanceIds: instanceIdArray });
  try {
    const awsResponse = await getInstanceDetails(instanceIdArray);
    for (const reservation of awsResponse.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        if (instance.State?.Name !== 'running') {
          throw new Error(
            `Instance ${instance.InstanceId} is in state '${instance.State?.Name}'. All instances must be running to reboot.`
          );
        }
      }
    }
    const response = await ec2Client.send(command);
    console.log('Instance rebooted:', instanceIdArray);
    return response;
  } catch (error) {
    console.error('Error rebooting instance:', error);
    throw error;
  }
}

// Function to get the public IP address of an EC2 instance ( useful for SSH access )
async function getInstancePublicIp(instanceId) {
  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });

  try {
    const awsResponse = await ec2Client.send(command);
    const reservations = awsResponse.Reservations || [];

    for (const reservation of reservations) {
      for (const instance of reservation.Instances || []) {
        return instance.PublicIpAddress || null;
      }
    }

    return null; // Instance not found or no public IP
  } catch (error) {
    console.error('Error fetching instance public IP:', error);
    throw error;
  }
}

// Function to terminate EC2 instances
async function terminateInstances(instanceIdArray) {
  const command = new TerminateInstancesCommand({
    InstanceIds: instanceIdArray,
  });

  try {
    const response = await ec2Client.send(command);
    console.log('Instance terminated:', response.TerminatingInstances);
    return response;
  } catch (error) {
    console.error('Error terminating instance:', error);
    throw error;
  }
}

module.exports = {
  createEC2KeyPair,
  checkExistingInfrastructure,
  handleConfigFile,
  createInfrastructure,
  mapAmiNamesToIds,
  createEC2Instance,
  getInstanceDetails,
  startInstances,
  stopInstances,
  rebootInstances,
  getInstancePublicIp,
  terminateInstances,
};
