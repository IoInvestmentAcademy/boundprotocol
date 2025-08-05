export const MSOHookV2 = [
  {
    inputs: [
      {
        internalType: "contract IPoolManager",
        name: "_poolManager",
        type: "address",
      },
      {
        internalType: "address",
        name: "_bound",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_priceDeviationThreshold",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidPriceRatio",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidThreshold",
    type: "error",
  },
  {
    inputs: [],
    name: "MonitoringNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "PoolDoesNotContainBOUND",
    type: "error",
  },
  {
    inputs: [],
    name: "PoolNotConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "SyncOperationFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newRatio",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deviation",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "syncTriggered",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
      },
    ],
    name: "PriceMonitored",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "poolId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "boundToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "otherToken",
        type: "address",
      },
    ],
    name: "PoolMonitoringStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "isSyncDown",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceRatio",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "exactAmountCalculated",
        type: "uint256",
      },
    ],
    name: "SyncOperationExecuted",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "hookContract",
            type: "address",
          },
          {
            internalType: "address",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "address",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fee",
            type: "uint8",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
          {
            internalType: "uint256",
            name: "amountSpecified",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sqrtPriceLimitX96Other",
            type: "uint256",
          },
        ],
        internalType: "struct IPoolManager.SwapParams",
        name: "params",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    name: "afterSwap",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "int128",
        name: "",
        type: "int128",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bound",
    outputs: [
      {
        internalType: "contract BOUND",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "boundIsCurrency0",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
            name: "currency0",
            type: "address",
          },
          {
            internalType: "address",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fee",
            type: "uint8",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "address",
            name: "hooks",
            type: "address",
          },
        ],
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
      },
    ],
    name: "configureMonitoredPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPoolState",
    outputs: [
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
      },
      {
        internalType: "int24",
        name: "tick",
        type: "int24",
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getHookPermissions",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "beforeInitialize",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterInitialize",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "beforeAddLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterAddLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "beforeRemoveLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterRemoveLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "beforeSwap",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterSwap",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "beforeDonate",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterDonate",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "beforeSwapReturnDelta",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterSwapReturnDelta",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterAddLiquidityReturnDelta",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "afterRemoveLiquidityReturnDelta",
            type: "bool",
          },
        ],
        internalType: "struct Hooks.Permissions",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getHookStats",
    outputs: [
      {
        internalType: "uint256",
        name: "currentThreshold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalSyncs",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "monitoringActive",
        type: "bool",
      },
      {
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "externalLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountBoundNeeded",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "boundLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "getAmountNew",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "isMonitoringActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastPriceRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastSyncAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "monitoredPool",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "address",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "fee",
            type: "uint8",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "address",
            name: "hooks",
            type: "address",
          },
        ],
        internalType: "struct PoolKey",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "monitoredPoolId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
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
    name: "poolManager",
    outputs: [
      {
        internalType: "contract IPoolManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceDeviationThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_active",
        type: "bool",
      },
    ],
    name: "setMonitoringActive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_threshold",
        type: "uint256",
      },
    ],
    name: "setPriceDeviationThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "targetRatio",
        type: "uint256",
      },
    ],
    name: "simulateSyncForTargetRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "syncAmount",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "currentSqrtPrice",
        type: "uint160",
      },
      {
        internalType: "uint160",
        name: "targetSqrtPrice",
        type: "uint160",
      },
      {
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "shouldBeLiquidityData",
    outputs: [
      {
        internalType: "uint256",
        name: "",
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
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSyncOperations",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "wouldTriggerSync",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
