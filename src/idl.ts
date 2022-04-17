import { Idl } from "@project-serum/anchor";

export const idl: Idl = {
  version: "0.1.0",
  name: "collateral_pay",
  instructions: [
    {
      name: "createChannel",
      accounts: [
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "paymentChannel",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "itemValue",
          type: "u64",
        },
        {
          name: "receiver",
          type: "publicKey",
        },
        {
          name: "receiverUsdcAccount",
          type: "publicKey",
        },
        {
          name: "vaultPda",
          type: "publicKey",
        },
        {
          name: "vaultBump",
          type: "u8",
        },
      ],
    },
    {
      name: "lockSol",
      accounts: [
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vaultPda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "paymentChannel",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "payAmount",
      accounts: [
        {
          name: "buyer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "seller",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "paymentChannel",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawLocked",
      accounts: [
        {
          name: "buyer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vaultPda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "paymentChannel",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "PaymentChannel",
      type: {
        kind: "struct",
        fields: [
          {
            name: "buyer",
            type: "publicKey",
          },
          {
            name: "receiver",
            type: "publicKey",
          },
          {
            name: "vaultPda",
            type: "publicKey",
          },
          {
            name: "vaultBump",
            type: "u8",
          },
          {
            name: "receiverUsdcAccount",
            type: "publicKey",
          },
          {
            name: "lockedSolAmount",
            type: "u64",
          },
          {
            name: "solLocked",
            type: "bool",
          },
          {
            name: "itemValue",
            type: "u64",
          },
          {
            name: "amountPaid",
            type: "u64",
          },
          {
            name: "paymentDue",
            type: "u128",
          },
          {
            name: "paymentDone",
            type: "bool",
          },
          {
            name: "canWithdraw",
            type: "bool",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "PaymentAlreadyDone",
      msg: "Payment already done, create a new channel!",
    },
    {
      code: 6001,
      name: "SolAlreadyLocked",
      msg: "Sol already locked!",
    },
    {
      code: 6002,
      name: "CannotWithdrawUnlessPayed",
      msg: "Cannot withdraw unless payed the full amount!",
    },
  ],
  metadata: {
    address: "H6jhN1MQLNVu1FG1ikb7MuM2qjww73LNzQRrD4kf9hVU",
  },
};
