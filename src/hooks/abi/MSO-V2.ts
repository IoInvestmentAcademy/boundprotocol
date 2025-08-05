export const MSO_V2_ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_externalToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_softCap",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_poolManager",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_positionManager",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "AddressEmptyCode"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "AddressInsufficientBalance"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "type": "error",
      "name": "ERC20InsufficientAllowance"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "type": "error",
      "name": "ERC20InsufficientBalance"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "ERC20InvalidApprover"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "ERC20InvalidReceiver"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "ERC20InvalidSender"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "ERC20InvalidSpender"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "FailedInnerCall"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_AlreadyLaunched"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_InvalidAddress"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_InvalidAmount"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_NotLaunched"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_SoftCapNotReached"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_TransferFailed"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "MSO_Unauthorized"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "OwnableInvalidOwner"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "OwnableUnauthorizedAccount"
    },
    {
      "inputs": [],
      "type": "error",
      "name": "ReentrancyGuardReentrantCall"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "type": "error",
      "name": "SafeERC20FailedOperation"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address",
          "indexed": true
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address",
          "indexed": true
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256",
          "indexed": false
        }
      ],
      "type": "event",
      "name": "Approval",
      "anonymous": false
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "previousOwner",
          "type": "address",
          "indexed": true
        },
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address",
          "indexed": true
        }
      ],
      "type": "event",
      "name": "OwnershipTransferred",
      "anonymous": false
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address",
          "indexed": true
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address",
          "indexed": true
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256",
          "indexed": false
        }
      ],
      "type": "event",
      "name": "Transfer",
      "anonymous": false
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "externalTokenAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "msoAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidityAdded",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "contribute"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "name": "contributions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "name": "contributors",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "emergencyWithdraw"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "executeSyncDown"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "executeSyncUp"
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "externalToken",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "getContributorCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "hookContract",
      "outputs": [
        {
          "internalType": "contract IMSOHook",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_hookContract",
          "type": "address"
        },
        {
          "internalType": "uint24",
          "name": "poolFee",
          "type": "uint24"
        },
        {
          "internalType": "int24",
          "name": "tickSpacing",
          "type": "int24"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "launchLP"
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "launched",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "liquidityTokenId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "mintForSync"
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "poolKey",
      "outputs": [
        {
          "internalType": "Currency",
          "name": "currency0",
          "type": "address"
        },
        {
          "internalType": "Currency",
          "name": "currency1",
          "type": "address"
        },
        {
          "internalType": "uint24",
          "name": "fee",
          "type": "uint24"
        },
        {
          "internalType": "int24",
          "name": "tickSpacing",
          "type": "int24"
        },
        {
          "internalType": "contract IHooks",
          "name": "hooks",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "poolManager",
      "outputs": [
        {
          "internalType": "contract IPoolManager",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "positionManager",
      "outputs": [
        {
          "internalType": "contract IPositionManager",
          "name": "",
          "type": "address"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "renounceOwnership"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_hookContract",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "setHookContract"
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "softCap",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "totalContributed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [],
      "stateMutability": "view",
      "type": "function",
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "transferOwnership"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "unlockCallback",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "withdrawFees",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "msoFeesCollected",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "externalFeesCollected",
          "type": "uint256"
        }
      ]
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidityToRemove",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function",
      "name": "withdrawLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "msoAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "externalAmount",
          "type": "uint256"
        }
      ]
    }
  ] as const;