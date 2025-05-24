// Entry point for the application
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressWs = require('express-ws');
const path = require('path');
const { allowedAmis, resourceMap } = require('./utils/resources');
const { handleConfigFile, createInfrastructure, mapAmiNamesToIds, checkExistingInfrastructure } = require('./utils/AWS-SDK');
require('dotenv').config();

const app = express();
expressWs(app); // Enable WebSocket support

// Middleware setup
app.use('/static', express.static(path.join(__dirname, 'views/static')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/favicon.ico', (req, res) => res.status(204).send());
app.use(require('./routes'));
app.use((req, res) => res.status(404).send('Route not found'));



async function setupInfrastructure() {
  const config = await handleConfigFile(); // Check if a valid config file ( ./infra-config.json ) exists 
  if (config) {
    Object.assign(resourceMap, config); // Merge existing config with resourceMap to be used in the app
    console.log('Existing valid configuration found. Using existing infrastructure.');
    return;
  }
  const existing = await checkExistingInfrastructure(); // Check if any existing AWS infrastructure is present on AWS or not before creating new resources
  if (existing.exists) {
    console.error('Existing AWS infrastructure detected:');
    console.error('- VPCs:', existing.resources.vpcs.map(v => v.VpcId));
    console.error('- Route Tables:', existing.resources.routeTables.map(rt => rt.RouteTableId));
    console.error('- Internet Gateways:', existing.resources.internetGateways.map(ig => ig.InternetGatewayId));
    console.error('- Subnets:', existing.resources.subnets.map(s => s.SubnetId));
    console.error('- Security Groups:', existing.resources.securityGroups.map(sg => sg.GroupId));
    throw new Error('Existing infrastructure found - please delete it before creating new resources');
  }
  const newResources = await createInfrastructure();
  Object.assign(resourceMap, newResources);
  console.log('Successfully created new infrastructure');
}

async function initializeApplication() {
  try {
    await setupInfrastructure();
    resourceMap.amis = await mapAmiNamesToIds(allowedAmis); // Map AMI names to { IDs and Username( ec2-user, ubuntu, Admin etc so that it can be used during ssh connecion ) }
    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(resourceMap); // Log the resourceMap to see the infrastructure details
    });
  } catch (error) {
    console.error('Initialization failed:', error.message);
    process.exit(1);
  }
}

initializeApplication();