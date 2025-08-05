export const IComptrollerLib = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_investmentAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minSharesQuantity",
        "type": "uint256"
      }
    ],
    "name": "buyShares",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sharesReceived",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_investmentAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_minSharesQuantity",
        "type": "uint256"
      }
    ],
    "name": "buySharesOnBehalf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sharesReceived",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDenominationAsset",
    "outputs": [
      {
        "internalType": "address",
        "name": "denominationAsset",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_sharesQuantity",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "_payoutAssets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_payoutAssetPercentages",
        "type": "uint256[]"
      }
    ],
    "name": "redeemSharesForSpecificAssets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "payoutAmounts_",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];