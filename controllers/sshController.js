// This module(controller) handles WebSocket connections for client and provides SSH access to EC2 instances.
const { Client } = require('ssh2');
const { getDecryptedUserKey, doesUserOwnInstance } = require('../model');
const { getInstanceDetails } = require('../utils/AWS-SDK');
const { resourceMap } = require('../utils/resources');

exports.handleConnection = async (ws, req) => {
  const instanceId = req.params.instanceId;
  const userId = req.user?.userId;
  try {
    if (!await doesUserOwnInstance(userId, instanceId) ) { // Check if the user owns the instance
      ws.send(`Access denied: you do not own instance ${instanceId}`);
      return ws.close();
    }
    const details = await getInstanceDetails([instanceId]);
    const inst = details.Reservations?.[0]?.Instances?.[0];
    if (!inst) {
      ws.send(`Instance ${instanceId} not found`);
      return ws.close();
    }
    const host = inst.PublicIpAddress;
    const imageId = inst.ImageId;
    if (!host) {
      ws.send(`Instance ${instanceId} has no public IP`);
      return ws.close();
    }
    
    const username = Object.values(resourceMap.amis).find(({ imageId }) => imageId === inst.ImageId)?.username || 'ec2-user';


    const privateKey = await getDecryptedUserKey(userId);
    if (!privateKey) {
      ws.send('Failed to load your SSH private key');
      return ws.close();
    }
    const conn = new Client();
    conn
      .on('ready', () => {
        conn.shell((err, stream) => {
          if (err) {
            ws.send(`SSH shell error: ${err.message}`);
            return ws.close();
          }
          stream.on('data', d => ws.send(d.toString()));
          stream.on('close', () => { conn.end(); ws.close(); });
          ws.on('message', msg => stream.write(msg));
          ws.on('close', () => conn.end());
        });
      })
      .on('error', err => {
        ws.send(`SSH connection error: ${err.message}`);
        ws.close();
      })
      .connect({ host, port: 22, username, privateKey });
  } catch (err) {
    console.error('SSH controller error:', err);
    ws.send('Internal server error');
    ws.close();
  }
};
