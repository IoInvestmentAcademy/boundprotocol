export const MSOInitializer = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "positionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "poolFactory",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoPriceSync",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoFeeCollector",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoLauncher",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoDandW",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoTreasury",
            type: "address",
          },
        ],
        internalType: "struct MSOConfig",
        name: "_config",
        type: "tuple",
      },
      {
        internalType: "address[]",
        name: "_accessList",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_passcodeHash",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "mso",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vaultOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "softCap",
        type: "uint256",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "config",
    outputs: [
      {
        internalType: "address",
        name: "positionManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "swapRouter",
        type: "address",
      },
      {
        internalType: "address",
        name: "poolFactory",
        type: "address",
      },
      {
        internalType: "address",
        name: "msoPriceSync",
        type: "address",
      },
      {
        internalType: "address",
        name: "msoFeeCollector",
        type: "address",
      },
      {
        internalType: "address",
        name: "msoLauncher",
        type: "address",
      },
      {
        internalType: "address",
        name: "msoDandW",
        type: "address",
      },
      {
        internalType: "address",
        name: "msoTreasury",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "positionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "poolFactory",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoPriceSync",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoFeeCollector",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoLauncher",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoDandW",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoTreasury",
            type: "address",
          },
        ],
        internalType: "struct MSOConfig",
        name: "config_",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_investmentToken",
        type: "address",
      },
    ],
    name: "getInvestmentTokenFee",
    outputs: [
      {
        internalType: "address",
        name: "investmentToken_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "initializationFee_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "syncFee_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOracle",
    outputs: [
      {
        internalType: "address",
        name: "oracle_",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_investmentToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_softCap",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_launchWaitingPeriod",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minimumTokenShare",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_tokenName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_tokenSymbol",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "_r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_s",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "_v",
        type: "uint8",
      },
    ],
    name: "initializeMSO",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "investmentTokenFees",
    outputs: [
      {
        internalType: "uint256",
        name: "syncFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "initializationFee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "msoRegistry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "positionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "poolFactory",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoPriceSync",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoFeeCollector",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoLauncher",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoDandW",
            type: "address",
          },
          {
            internalType: "address",
            name: "msoTreasury",
            type: "address",
          },
        ],
        internalType: "struct MSOConfig",
        name: "_config",
        type: "tuple",
      },
    ],
    name: "updateConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_investmentToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_initializationFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_syncFee",
        type: "uint256",
      },
    ],
    name: "updateInvestmentTokenFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newOracle",
        type: "address",
      },
      {
        internalType: "string",
        name: "_passcode",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "_newPasscodeHash",
        type: "bytes32",
      },
    ],
    name: "updateOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "vaultRegistry",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
