{
  "$metadata": {
    "httpStatusCode": 200,
    "requestId": "1b849157-cf55-4656-b7b4-7bec0243ce0a",
    "attempts": 1,
    "totalRetryDelay": 0
  },
  "InstanceTypes": [
    {
      "InstanceType": "t3a.micro",
      "CurrentGeneration": true,
      "FreeTierEligible": false,
      "SupportedUsageClasses": [
        "on-demand",
        "spot"
      ],
      "SupportedRootDeviceTypes": [
        "ebs"
      ],
      "SupportedVirtualizationTypes": [
        "hvm"
      ],
      "BareMetal": false,
      "Hypervisor": "nitro",
      "ProcessorInfo": {
        "SupportedArchitectures": [
          "x86_64"
        ],
        "SustainedClockSpeedInGhz": 2.2,
        "Manufacturer": "AMD"
      },
      "VCpuInfo": {
        "DefaultVCpus": 2,
        "DefaultCores": 1,
        "DefaultThreadsPerCore": 2,
        "ValidCores": [
          1
        ],
        "ValidThreadsPerCore": [
          1,
          2
        ]
      },
      "MemoryInfo": {
        "SizeInMiB": 1024
      },
      "InstanceStorageSupported": false,
      "EbsInfo": {
        "EbsOptimizedSupport": "default",
        "EncryptionSupport": "supported",
        "EbsOptimizedInfo": {
          "BaselineBandwidthInMbps": 90,
          "BaselineThroughputInMBps": 11.25,
          "BaselineIops": 500,
          "MaximumBandwidthInMbps": 2085,
          "MaximumThroughputInMBps": 260.625,
          "MaximumIops": 11800
        },
        "NvmeSupport": "required"
      },
      "NetworkInfo": {
        "NetworkPerformance": "Up to 5 Gigabit",
        "MaximumNetworkInterfaces": 2,
        "MaximumNetworkCards": 1,
        "DefaultNetworkCardIndex": 0,
        "NetworkCards": [
          {
            "NetworkCardIndex": 0,
            "NetworkPerformance": "Up to 5 Gigabit",
            "MaximumNetworkInterfaces": 2,
            "BaselineBandwidthInGbps": 0.064,
            "PeakBandwidthInGbps": 5
          }
        ],
        "Ipv4AddressesPerInterface": 2,
        "Ipv6AddressesPerInterface": 2,
        "Ipv6Supported": true,
        "EnaSupport": "required",
        "EfaSupported": false,
        "EncryptionInTransitSupported": false,
        "EnaSrdSupported": false
      },
      "PlacementGroupInfo": {
        "SupportedStrategies": [
          "partition",
          "spread"
        ]
      },
      "HibernationSupported": true,
      "BurstablePerformanceSupported": true,
      "DedicatedHostsSupported": false,
      "AutoRecoverySupported": true,
      "SupportedBootModes": [
        "legacy-bios",
        "uefi"
      ],
      "NitroEnclavesSupport": "unsupported",
      "NitroTpmSupport": "supported",
      "NitroTpmInfo": {
        "SupportedVersions": [
          "2.0"
        ]
      },
      "PhcSupport": "unsupported"
    },
    {
      "InstanceType": "t3.micro",
      "CurrentGeneration": true,
      "FreeTierEligible": false,
      "SupportedUsageClasses": [
        "on-demand",
        "spot"
      ],
      "SupportedRootDeviceTypes": [
        "ebs"
      ],
      "SupportedVirtualizationTypes": [
        "hvm"
      ],
      "BareMetal": false,
      "Hypervisor": "nitro",
      "ProcessorInfo": {
        "SupportedArchitectures": [
          "x86_64"
        ],
        "SustainedClockSpeedInGhz": 2.5,
        "Manufacturer": "Intel"
      },
      "VCpuInfo": {
        "DefaultVCpus": 2,
        "DefaultCores": 1,
        "DefaultThreadsPerCore": 2,
        "ValidCores": [
          1
        ],
        "ValidThreadsPerCore": [
          1,
          2
        ]
      },
      "MemoryInfo": {
        "SizeInMiB": 1024
      },
      "InstanceStorageSupported": false,
      "EbsInfo": {
        "EbsOptimizedSupport": "default",
        "EncryptionSupport": "supported",
        "EbsOptimizedInfo": {
          "BaselineBandwidthInMbps": 87,
          "BaselineThroughputInMBps": 10.875,
          "BaselineIops": 500,
          "MaximumBandwidthInMbps": 2085,
          "MaximumThroughputInMBps": 260.625,
          "MaximumIops": 11800
        },
        "NvmeSupport": "required"
      },
      "NetworkInfo": {
        "NetworkPerformance": "Up to 5 Gigabit",
        "MaximumNetworkInterfaces": 2,
        "MaximumNetworkCards": 1,
        "DefaultNetworkCardIndex": 0,
        "NetworkCards": [
          {
            "NetworkCardIndex": 0,
            "NetworkPerformance": "Up to 5 Gigabit",
            "MaximumNetworkInterfaces": 2,
            "BaselineBandwidthInGbps": 0.064,
            "PeakBandwidthInGbps": 5
          }
        ],
        "Ipv4AddressesPerInterface": 2,
        "Ipv6AddressesPerInterface": 2,
        "Ipv6Supported": true,
        "EnaSupport": "required",
        "EfaSupported": false,
        "EncryptionInTransitSupported": false,
        "EnaSrdSupported": false
      },
      "PlacementGroupInfo": {
        "SupportedStrategies": [
          "partition",
          "spread"
        ]
      },
      "HibernationSupported": true,
      "BurstablePerformanceSupported": true,
      "DedicatedHostsSupported": true,
      "AutoRecoverySupported": true,
      "SupportedBootModes": [
        "legacy-bios",
        "uefi"
      ],
      "NitroEnclavesSupport": "unsupported",
      "NitroTpmSupport": "supported",
      "NitroTpmInfo": {
        "SupportedVersions": [
          "2.0"
        ]
      },
      "PhcSupport": "unsupported"
    },
    {
      "InstanceType": "c5.large",
      "CurrentGeneration": true,
      "FreeTierEligible": false,
      "SupportedUsageClasses": [
        "on-demand",
        "spot"
      ],
      "SupportedRootDeviceTypes": [
        "ebs"
      ],
      "SupportedVirtualizationTypes": [
        "hvm"
      ],
      "BareMetal": false,
      "Hypervisor": "nitro",
      "ProcessorInfo": {
        "SupportedArchitectures": [
          "x86_64"
        ],
        "SustainedClockSpeedInGhz": 3.4,
        "Manufacturer": "Intel"
      },
      "VCpuInfo": {
        "DefaultVCpus": 2,
        "DefaultCores": 1,
        "DefaultThreadsPerCore": 2,
        "ValidCores": [
          1
        ],
        "ValidThreadsPerCore": [
          1,
          2
        ]
      },
      "MemoryInfo": {
        "SizeInMiB": 4096
      },
      "InstanceStorageSupported": false,
      "EbsInfo": {
        "EbsOptimizedSupport": "default",
        "EncryptionSupport": "supported",
        "EbsOptimizedInfo": {
          "BaselineBandwidthInMbps": 650,
          "BaselineThroughputInMBps": 81.25,
          "BaselineIops": 4000,
          "MaximumBandwidthInMbps": 4750,
          "MaximumThroughputInMBps": 593.75,
          "MaximumIops": 20000
        },
        "NvmeSupport": "required"
      },
      "NetworkInfo": {
        "NetworkPerformance": "Up to 10 Gigabit",
        "MaximumNetworkInterfaces": 3,
        "MaximumNetworkCards": 1,
        "DefaultNetworkCardIndex": 0,
        "NetworkCards": [
          {
            "NetworkCardIndex": 0,
            "NetworkPerformance": "Up to 10 Gigabit",
            "MaximumNetworkInterfaces": 3,
            "BaselineBandwidthInGbps": 0.75,
            "PeakBandwidthInGbps": 10
          }
        ],
        "Ipv4AddressesPerInterface": 10,
        "Ipv6AddressesPerInterface": 10,
        "Ipv6Supported": true,
        "EnaSupport": "required",
        "EfaSupported": false,
        "EncryptionInTransitSupported": false,
        "EnaSrdSupported": false
      },
      "PlacementGroupInfo": {
        "SupportedStrategies": [
          "cluster",
          "partition",
          "spread"
        ]
      },
      "HibernationSupported": true,
      "BurstablePerformanceSupported": false,
      "DedicatedHostsSupported": true,
      "AutoRecoverySupported": true,
      "SupportedBootModes": [
        "legacy-bios",
        "uefi"
      ],
      "NitroEnclavesSupport": "unsupported",
      "NitroTpmSupport": "supported",
      "NitroTpmInfo": {
        "SupportedVersions": [
          "2.0"
        ]
      },
      "PhcSupport": "unsupported"
    },
    {
      "InstanceType": "r5.large",
      "CurrentGeneration": true,
      "FreeTierEligible": false,
      "SupportedUsageClasses": [
        "on-demand",
        "spot"
      ],
      "SupportedRootDeviceTypes": [
        "ebs"
      ],
      "SupportedVirtualizationTypes": [
        "hvm"
      ],
      "BareMetal": false,
      "Hypervisor": "nitro",
      "ProcessorInfo": {
        "SupportedArchitectures": [
          "x86_64"
        ],
        "SustainedClockSpeedInGhz": 3.1,
        "Manufacturer": "Intel"
      },
      "VCpuInfo": {
        "DefaultVCpus": 2,
        "DefaultCores": 1,
        "DefaultThreadsPerCore": 2,
        "ValidCores": [
          1
        ],
        "ValidThreadsPerCore": [
          1,
          2
        ]
      },
      "MemoryInfo": {
        "SizeInMiB": 16384
      },
      "InstanceStorageSupported": false,
      "EbsInfo": {
        "EbsOptimizedSupport": "default",
        "EncryptionSupport": "supported",
        "EbsOptimizedInfo": {
          "BaselineBandwidthInMbps": 650,
          "BaselineThroughputInMBps": 81.25,
          "BaselineIops": 3600,
          "MaximumBandwidthInMbps": 4750,
          "MaximumThroughputInMBps": 593.75,
          "MaximumIops": 18750
        },
        "NvmeSupport": "required"
      },
      "NetworkInfo": {
        "NetworkPerformance": "Up to 10 Gigabit",
        "MaximumNetworkInterfaces": 3,
        "MaximumNetworkCards": 1,
        "DefaultNetworkCardIndex": 0,
        "NetworkCards": [
          {
            "NetworkCardIndex": 0,
            "NetworkPerformance": "Up to 10 Gigabit",
            "MaximumNetworkInterfaces": 3,
            "BaselineBandwidthInGbps": 0.75,
            "PeakBandwidthInGbps": 10
          }
        ],
        "Ipv4AddressesPerInterface": 10,
        "Ipv6AddressesPerInterface": 10,
        "Ipv6Supported": true,
        "EnaSupport": "required",
        "EfaSupported": false,
        "EncryptionInTransitSupported": false,
        "EnaSrdSupported": false
      },
      "PlacementGroupInfo": {
        "SupportedStrategies": [
          "cluster",
          "partition",
          "spread"
        ]
      },
      "HibernationSupported": true,
      "BurstablePerformanceSupported": false,
      "DedicatedHostsSupported": true,
      "AutoRecoverySupported": true,
      "SupportedBootModes": [
        "legacy-bios",
        "uefi"
      ],
      "NitroEnclavesSupport": "unsupported",
      "NitroTpmSupport": "supported",
      "NitroTpmInfo": {
        "SupportedVersions": [
          "2.0"
        ]
      },
      "PhcSupport": "unsupported"
    },
    {
      "InstanceType": "m5.large",
      "CurrentGeneration": true,
      "FreeTierEligible": false,
      "SupportedUsageClasses": [
        "on-demand",
        "spot"
      ],
      "SupportedRootDeviceTypes": [
        "ebs"
      ],
      "SupportedVirtualizationTypes": [
        "hvm"
      ],
      "BareMetal": false,
      "Hypervisor": "nitro",
      "ProcessorInfo": {
        "SupportedArchitectures": [
          "x86_64"
        ],
        "SustainedClockSpeedInGhz": 3.1,
        "Manufacturer": "Intel"
      },
      "VCpuInfo": {
        "DefaultVCpus": 2,
        "DefaultCores": 1,
        "DefaultThreadsPerCore": 2,
        "ValidCores": [
          1
        ],
        "ValidThreadsPerCore": [
          1,
          2
        ]
      },
      "MemoryInfo": {
        "SizeInMiB": 8192
      },
      "InstanceStorageSupported": false,
      "EbsInfo": {
        "EbsOptimizedSupport": "default",
        "EncryptionSupport": "supported",
        "EbsOptimizedInfo": {
          "BaselineBandwidthInMbps": 650,
          "BaselineThroughputInMBps": 81.25,
          "BaselineIops": 3600,
          "MaximumBandwidthInMbps": 4750,
          "MaximumThroughputInMBps": 593.75,
          "MaximumIops": 18750
        },
        "NvmeSupport": "required"
      },
      "NetworkInfo": {
        "NetworkPerformance": "Up to 10 Gigabit",
        "MaximumNetworkInterfaces": 3,
        "MaximumNetworkCards": 1,
        "DefaultNetworkCardIndex": 0,
        "NetworkCards": [
          {
            "NetworkCardIndex": 0,
            "NetworkPerformance": "Up to 10 Gigabit",
            "MaximumNetworkInterfaces": 3,
            "BaselineBandwidthInGbps": 0.75,
            "PeakBandwidthInGbps": 10
          }
        ],
        "Ipv4AddressesPerInterface": 10,
        "Ipv6AddressesPerInterface": 10,
        "Ipv6Supported": true,
        "EnaSupport": "required",
        "EfaSupported": false,
        "EncryptionInTransitSupported": false,
        "EnaSrdSupported": false
      },
      "PlacementGroupInfo": {
        "SupportedStrategies": [
          "cluster",
          "partition",
          "spread"
        ]
      },
      "HibernationSupported": true,
      "BurstablePerformanceSupported": false,
      "DedicatedHostsSupported": true,
      "AutoRecoverySupported": true,
      "SupportedBootModes": [
        "legacy-bios",
        "uefi"
      ],
      "NitroEnclavesSupport": "unsupported",
      "NitroTpmSupport": "supported",
      "NitroTpmInfo": {
        "SupportedVersions": [
          "2.0"
        ]
      },
      "PhcSupport": "unsupported"
    }
  ]
}
Candidate Instance Types that support the AMI requirements:
- t3a.micro
- t3.micro
- c5.large
- r5.large
- m5.large
ayush@ayush-Inspiron-3542:~/Desktop/final$ 

