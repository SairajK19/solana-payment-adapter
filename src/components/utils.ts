import * as anchor from "@project-serum/anchor";
import * as serum from "@project-serum/serum";
// import * as serumComm from "@project-serum/common";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TokenInstructions } from "@project-serum/token";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

// export async function getTokenAccount(provider: any, addr: any) {
//   return await serumComm.getTokenAccount(provider, addr);
// }

// const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
//   "ATokenGPvbdGVxr0b2hvZbsiqW5xWH25efTNsLJA8knL"
// );

export async function createMint(
  provider: anchor.AnchorProvider,
  authority?: PublicKey
) {
  // Create mint account
  const mint = anchor.web3.Keypair.generate();
  console.log(provider);

  console.log(mint.publicKey.toString(), provider.wallet.publicKey.toString());

  const instructions = [
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: 82,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeMint({
      mint: mint.publicKey,
      decimals: 0,
      mintAuthority: provider.wallet.publicKey,
    }),
  ];

  console.log(instructions);

  const tx = new anchor.web3.Transaction().add(...instructions);

  await provider.sendAndConfirm(tx, [mint]).then((data) => console.log(data));

  return mint.publicKey;
}

export async function createAssociatedTokenAccount(
  provider: any,
  mint: PublicKey,
  owner: PublicKey
) {
  const tokenAcc = anchor.web3.Keypair.generate();
  const tx = new anchor.web3.Transaction().add(
    ...[
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(
          165
        ),
        newAccountPubkey: tokenAcc.publicKey,
        programId: TOKEN_PROGRAM_ID,
        space: 165,
      }),
      TokenInstructions.initializeAccount({
        account: tokenAcc.publicKey,
        mint: mint,
        owner, // owner of the mint
      }),
    ]
  );

  await provider.sendAndConfirm(tx, [tokenAcc]);

  return tokenAcc.publicKey;
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
}
