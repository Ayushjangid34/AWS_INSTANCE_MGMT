// This controller handles user-related actions such as launching instances, fetching instance details, and performing actions on instances.
// It also serves the dashboard and terminal pages.

const model = require('../model');
const { resourceMap, allowedAmis, allowedInstanceTypes, allowedSecurityGroups } = require('../utils/resources');
const { createEC2Instance, getInstanceDetails, startInstances, stopInstances, rebootInstances, terminateInstances } = require('../utils/AWS-SDK');
const path = require('path');
require('dotenv').config();

// This function serves the dashboard page for authenticated users
exports.getDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/protected/dashboard.html'));
};

// This function serves the instance creation form for authenticated users
exports.getInstanceCreationForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/protected/launchInstance.html'));
};


// This function launches a new EC2 instance based on user input from the form
exports.launchInstance = async (req, res) => {
  const { ami_name, instance_type, security, instance_name } = req.body;
  // Validate inputs
  if (!allowedAmis.includes(ami_name)) {
    return res.status(400).json({ message: 'Invalid AMI selected.' });
  }
  if (!allowedInstanceTypes.includes(instance_type)) {
    return res.status(400).json({ message: 'Invalid instance type selected.' });
  }
  if (!allowedSecurityGroups.includes(security)) {
    return res.status(400).json({ message: 'Invalid security group selection.' });
  }
  const namePattern = /^[a-zA-Z0-9-_]{1,128}$/;
  if (!namePattern.test(instance_name)) {
    return res.status(400).json({ message: 'Invalid instance name. Use only letters, numbers, dashes, or underscores (max 128 chars).' });
  }
  try {
    const amiId = resourceMap.amis ? resourceMap.amis[ami_name].imageId : undefined;
    // Set up security groups based on user's choice (SSH-only or SSH+Web)
    const securityGroupIds = security === 'sg-ssh-web'
      ? (resourceMap.securityGroups || []).map(o => o.id)
      : [(resourceMap.securityGroups || []).find(o => o.name === 'project-pmWkWSBCL51Bfkhn79x-ssh-sg')?.id];

    // Get the user's SSH key name for accessing the server
    const keyName = await model.getUserKeyName(req.user.userId);

    // Actually create the EC2 instance with all the configs
    const result = await createEC2Instance(
      instance_name,
      resourceMap.vpc.id,
      resourceMap.subnet.id,
      securityGroupIds,
      amiId,
      instance_type,
      keyName
    );
    // Helper function to get a friendly OS name from the AMI
    function getOSName(ami) {
      const lower = ami.toLowerCase();
      if (lower.includes('ubuntu-jammy')) return 'Ubuntu 22.04 (Jammy)';
      if (lower.includes('ubuntu-noble')) return 'Ubuntu 24.04 (Noble)';
      if (lower.includes('amzn2')) return 'Amazon Linux 2';
      if (lower.includes('al2023')) return 'Amazon Linux 2023';
      if (lower.includes('rhel')) return 'RHEL';
      if (lower.includes('suse')) return 'SUSE Linux';
      if (lower.includes('debian')) return 'Debian';
      return 'Unknown';
    }
    // Save the new instance details to our database
    await model.insertUserInstance({
      instanceId: result.InstanceId,
      userId: req.user.userId,
      instanceOS: getOSName(ami_name),
    });
    res.status(200).json({ message: 'Instance launched successfully, redirecting you to dashboard. . . ' });
  } catch (error) {
    console.error('Error launching instance:', error);
    res.status(500).json({ message: `Error launching instance: ${error}`, error: error.message });
  }
};

// This function fetches all instances owned by the user and their details and sends them to the client for rendring the dashboard table
exports.fetchUserInstancesDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get all instances this user owns from our database
    const dbInstances = await model.getUserInstances(userId);

    // If user has no instances, return empty list
    if (!dbInstances.length) {
      return res.status(200).json({ message: 'No instances found.', instances: [] });
    }

    // Get the list of instance IDs
    const instanceIds = dbInstances.map(row => row.instanceId);

    // Get detailed information about these instances from AWS
    const awsResponse = await getInstanceDetails(instanceIds);

    // Create a map for easy lookup of instance details
    const awsMap = {};
    for (const reservation of awsResponse.Reservations || []) {
      for (const inst of reservation.Instances || []) {
        awsMap[inst.InstanceId] = inst;
      }
    }

    // Combine our database info with AWS info for each instance
    const instances = dbInstances.map(({ instanceId, instanceOS }) => {
      const inst = awsMap[instanceId] || {};
      const nameTag = inst.Tags?.find(tag => tag.Key === 'Name')?.Value || '';
      const securityGroups = inst.SecurityGroups?.map(sg => sg.GroupName).join(', ') || '';
      
      return {
        instanceName: nameTag,
        instanceId,
        status: inst.State?.Name || 'Unknown',
        type: inst.InstanceType || 'Unknown',
        securityGroup: securityGroups === 'project-pmWkWSBCL51Bfkhn79x-ssh-sg' ? 'SSH ONLY' : 'SSH + WEB',
        launchTime: inst.LaunchTime || null,
        os: instanceOS,
      };
    });

    res.status(200).json({ instances });
  } catch (err) {
    console.error('Error fetching instance details:', err);
    res.status(500).json({ message: 'Failed to fetch instance details.', error: err.message });
  }
};


// handles actions like start, stop, reboot, and terminate on instances
exports.handleActions = async (req, res) => {
  const { action, instanceIds } = req.body;
  if (!action || !instanceIds) {
    return res.status(400).json({ message: 'Both action and instanceId are required.' });
  }
  try {
    let result;
    switch (action) {
      case 'start':
        result = await startInstances(instanceIds);
        break;
      case 'stop':
        result = await stopInstances(instanceIds);
        break;
      case 'reboot':
        result = await rebootInstances(instanceIds);
        break;
      case 'terminate':
        result = await terminateInstances(instanceIds);
        
        model.deleteInstanceByInstanceId(instanceIds);
        break;
      default:
        return res.status(400).json({ message: 'Invalid action. Supported actions are start, stop, reboot, terminate.' });
    }
    res.status(200).json({ message: `Instance ${action}ed successfully.`, result });
  } catch (error) {
    console.error(`Error while trying to ${action} instance:`, error);
    res.status(500).json({ message: `Failed to ${action} instance.`, error: error.message });
  }
};


// Serves the terminal page for authenticated users
exports.getTerminal = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/protected/terminal.html'));
};


