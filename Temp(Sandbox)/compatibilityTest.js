const {
  EC2Client,
  DescribeInstanceTypesCommand,
  DescribeImagesCommand,
} = require("@aws-sdk/client-ec2");
require("dotenv").config();

const REGION = "ap-south-1";
const client = new EC2Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Replace these with your target AMI and instance types

const instanceTypesToCheck = ["t2.micro", "t2.large", "t2.medium", "t2.small", "t3.micro", "t3.large", "t3.medium", "t3.small"];

(async () => {
  try {
    // Step 1: Describe the AMI to get its architecture and virtualization type
    const amiData = await client.send(
      new DescribeImagesCommand({
        Filters: [
          {
            Name: "name",
            Values: ['suse-sles-15-sp6-v20250130-hvm-ssd-x86_64',
    'amzn2-ami-kernel-5.10-hvm-2.0.20250405.0-x86_64-gp2',
    'RHEL-9.5.0_HVM-20250313-x86_64-0-Hourly2-GP3',
    'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20250305',
    'al2023-ami-2023.7.20250331.0-kernel-6.1-x86_64',
    'debian-12-amd64-20250316-2053',
    'ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-20250305' ],
          },
        ],
      })
    );

    if (!amiData.Images || amiData.Images.length === 0) {
      throw new Error("AMI not found.");
    }

    const ami = amiData.Images[0];
    const { Architecture, VirtualizationType } = ami;

    console.log(amiData);

    console.log(`AMI Architecture: ${Architecture}`);
    console.log(`AMI Virtualization Type: ${VirtualizationType}`);

    // Step 2: Get instance type info and check compatibility
    const compatibleInstanceTypes = [];

    const describeCmd = new DescribeInstanceTypesCommand({
      InstanceTypes: instanceTypesToCheck,
    });

    const response = await client.send(describeCmd);

    for (const typeInfo of response.InstanceTypes) {
      const instanceType = typeInfo.InstanceType;
      const archs = typeInfo.ProcessorInfo.SupportedArchitectures;
      const virtTypes = typeInfo.SupportedVirtualizationTypes;

      if (
        archs.includes(Architecture) &&
        virtTypes.includes(VirtualizationType)
      ) {
        compatibleInstanceTypes.push(instanceType);
      }
    }

    console.log(JSON.stringify(compatibleInstanceTypes, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
})();
