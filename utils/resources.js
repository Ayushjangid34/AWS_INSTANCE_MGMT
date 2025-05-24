// This file contains allowedAmis, allowedInstanceTypes, and allowedSecurityGroups ( All are tested and configured )
// It plays a crucial role in the project by centralizing the list of user-allowed AWS resources.
// These configurations are used by other modules (e.g., controllers, AWS SDK) to enforce consistent resource usage.


const resourceMap = {};
const allowedAmis = [
  'suse-sles-15-sp6-v20250130-hvm-ssd-x86_64',
  'amzn2-ami-kernel-5.10-hvm-2.0.20250405.0-x86_64-gp2',
  'RHEL-9.5.0_HVM-20250313-x86_64-0-Hourly2-GP3',
  'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20250305',
  'al2023-ami-2023.7.20250331.0-kernel-6.1-x86_64',
  'debian-12-amd64-20250316-2053',
  'ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-20250305',
];

// user can only create below instance types ( can be changed over requirements ) 
const allowedInstanceTypes = [
  't2.micro', 't2.small', 't2.medium', 't2.large',
  't3.micro', 't3.small', 't3.medium', 't3.large',
];

// Security groups that are provided to the users( also can be changed over requirements )
const allowedSecurityGroups = [
  'sg-ssh-only',
  'sg-ssh-web',
];
module.exports = {
  resourceMap,
  allowedAmis,
  allowedInstanceTypes,
  allowedSecurityGroups,
};