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
        name: "_mso",
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
    type: "error",
    name: "HookNotImplemented",
  },
  {
    inputs: [],
    type: "error",
    name: "InvalidPool",
  },
  {
    inputs: [],
    type: "error",
    name: "InvalidPriceRatio",
  },
  {
    inputs: [],
    type: "error",
    name: "InvalidThreshold",
  },
  {
    inputs: [],
    type: "error",
    name: "MonitoringNotActive",
  },
  {
    inputs: [],
    type: "error",
    name: "NotPoolManager",
  },
  {
    inputs: [],
    type: "error",
    name: "NotSelf",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableInvalidOwner",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    type: "error",
    name: "OwnableUnauthorizedAccount",
  },
  {
    inputs: [],
    type: "error",
    name: "PoolDoesNotContainMSO",
  },
  {
    inputs: [],
    type: "error",
    name: "PoolNotConfigured",
  },
  {
    inputs: [],
    type: "error",
    name: "SyncOperationFailed",
  },
  {
    inputs: [
      {
        internalType: "uint160",
        name: "currentSqrtPrice",
        type: "uint160",
        indexed: false,
      },
      {
        internalType: "uint160",
        name: "targetSqrtPrice",
        type: "uint160",
        indexed: false,
      },
      {
        internalType: "uint128",
        name: "liquidity",
        type: "uint128",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "calculatedAmount",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "LiquidityBasedSyncCalculated",
    anonymous: false,
  },
  {
    inputs: [],
    type: "event",
    name: "MonitoringActivated",
    anonymous: false,
  },
  {
    inputs: [],
    type: "event",
    name: "MonitoringDeactivated",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "previousOwner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
        indexed: true,
      },
    ],
    type: "event",
    name: "OwnershipTransferred",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "PoolId",
        name: "poolId",
        type: "bytes32",
        indexed: true,
      },
      {
        internalType: "address",
        name: "msoToken",
        type: "address",
        indexed: false,
      },
      {
        internalType: "address",
        name: "otherToken",
        type: "address",
        indexed: false,
      },
    ],
    type: "event",
    name: "PoolMonitoringStarted",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "oldThreshold",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "newThreshold",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "PriceDeviationThresholdUpdated",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newRatio",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "deviation",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "bool",
        name: "syncTriggered",
        type: "bool",
        indexed: false,
      },
      {
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
        indexed: false,
      },
    ],
    type: "event",
    name: "PriceMonitored",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "isSyncDown",
        type: "bool",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "priceRatio",
        type: "uint256",
        indexed: false,
      },
      {
        internalType: "uint128",
        name: "poolLiquidity",
        type: "uint128",
        indexed: false,
      },
      {
        internalType: "uint256",
        name: "exactAmountCalculated",
        type: "uint256",
        indexed: false,
      },
    ],
    type: "event",
    name: "SyncOperationExecuted",
    anonymous: false,
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct ModifyLiquidityParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "int256",
            name: "liquidityDelta",
            type: "int256",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
      },
      {
        internalType: "BalanceDelta",
        name: "delta0",
        type: "int256",
      },
      {
        internalType: "BalanceDelta",
        name: "delta1",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "afterAddLiquidity",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "BalanceDelta",
        name: "",
        type: "int256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "afterDonate",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
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
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "afterInitialize",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct ModifyLiquidityParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "int256",
            name: "liquidityDelta",
            type: "int256",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
      },
      {
        internalType: "BalanceDelta",
        name: "delta0",
        type: "int256",
      },
      {
        internalType: "BalanceDelta",
        name: "delta1",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "afterRemoveLiquidity",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "BalanceDelta",
        name: "",
        type: "int256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct SwapParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "bool",
            name: "zeroForOne",
            type: "bool",
          },
          {
            internalType: "int256",
            name: "amountSpecified",
            type: "int256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
      },
      {
        internalType: "BalanceDelta",
        name: "delta",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
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
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct ModifyLiquidityParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "int256",
            name: "liquidityDelta",
            type: "int256",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "beforeAddLiquidity",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "uint256",
        name: "amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "beforeDonate",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96",
        type: "uint160",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "beforeInitialize",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct ModifyLiquidityParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "int24",
            name: "tickLower",
            type: "int24",
          },
          {
            internalType: "int24",
            name: "tickUpper",
            type: "int24",
          },
          {
            internalType: "int256",
            name: "liquidityDelta",
            type: "int256",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "beforeRemoveLiquidity",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
      {
        internalType: "struct SwapParams",
        name: "params",
        type: "tuple",
        components: [
          {
            internalType: "bool",
            name: "zeroForOne",
            type: "bool",
          },
          {
            internalType: "int256",
            name: "amountSpecified",
            type: "int256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
      },
      {
        internalType: "bytes",
        name: "hookData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "beforeSwap",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
      {
        internalType: "BeforeSwapDelta",
        name: "",
        type: "int256",
      },
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "struct PoolKey",
        name: "key",
        type: "tuple",
        components: [
          {
            internalType: "Currency",
            name: "currency0",
            type: "address",
          },
          {
            internalType: "Currency",
            name: "currency1",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "int24",
            name: "tickSpacing",
            type: "int24",
          },
          {
            internalType: "contract IHooks",
            name: "hooks",
            type: "address",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "configureMonitoredPool",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "usdcLiquidity",
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
    stateMutability: "pure",
    type: "function",
    name: "getAmountNew",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
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
  },
  {
    inputs: [],
    stateMutability: "pure",
    type: "function",
    name: "getHookPermissions",
    outputs: [
      {
        internalType: "struct Hooks.Permissions",
        name: "",
        type: "tuple",
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
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
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
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "isMonitoringActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "lastPriceRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "lastSyncAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "monitoredPool",
    outputs: [
      {
        internalType: "Currency",
        name: "currency0",
        type: "address",
      },
      {
        internalType: "Currency",
        name: "currency1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
      {
        internalType: "contract IHooks",
        name: "hooks",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "monitoredPoolId",
    outputs: [
      {
        internalType: "PoolId",
        name: "",
        type: "bytes32",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "mso",
    outputs: [
      {
        internalType: "contract MSO",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "msoIsCurrency0",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "poolManager",
    outputs: [
      {
        internalType: "contract IPoolManager",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "priceDeviationThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    name: "renounceOwnership",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_active",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "setMonitoringActive",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_threshold",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "setPriceDeviationThreshold",
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "shouldBeLiquidityData",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "targetRatio",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
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
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
    name: "totalSyncOperations",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "transferOwnership",
  },
  {
    inputs: [],
    stateMutability: "view",
    type: "function",
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
  },
];
