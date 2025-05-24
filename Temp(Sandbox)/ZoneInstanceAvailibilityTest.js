const { DescribeInstanceTypeOfferingsCommand } = require("@aws-sdk/client-ec2");
const ec2Client = new EC2Client({ region: process.env.AWS_REGION });

/**
 * Returns an array of Availability Zones that support all of the given instance types.
 *
 * @param {string[]} instanceTypes - The list of instance types you want to check (e.g. ['t2.micro', 't3.small', ...]).
 * @returns {Promise<string[]>} - A promise that resolves to an array of AZ names (e.g. ['ap-south-1a', ...]).
 */
async function getCommonAZsForInstanceTypes(instanceTypes) {
  // 1. Fetch all offerings for any of the instanceTypes
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

  // 2. Build a map: AZ -> Set of instance types available there
  const azMap = {};
  for (const offering of response.InstanceTypeOfferings) {
    const az = offering.Location;
    const type = offering.InstanceType;
    if (!azMap[az]) azMap[az] = new Set();
    azMap[az].add(type);
  }

  // 3. Filter the AZs to those that have *all* requested instance types
  const commonAZs = Object.entries(azMap)
    .filter(([az, typesSet]) =>
      instanceTypes.every(type => typesSet.has(type))
    )
    .map(([az]) => az);

  return commonAZs;
}

// — Usage example —
(async () => {
  const allowedInstanceTypes = [
    't2.micro', 't2.small', 't2.medium', 't2.large',
    't3.micro', 't3.small', 't3.medium', 't3.large',
  ];

  try {
    const azs = await getCommonAZsForInstanceTypes(allowedInstanceTypes);
    console.log("AZs supporting all allowed instance types:", azs);
  } catch (err) {
    console.error("Error fetching AZ support:", err);
  }
})();
