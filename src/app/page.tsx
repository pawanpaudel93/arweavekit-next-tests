"use client";

import { Othent } from "arweavekit/auth";
import { useState } from "react";
import {
  createTransaction,
  signTransaction,
  postTransaction,
} from "arweavekit/transaction";
import { queryAllTransactionsGQL } from "arweavekit/graphql";
import { Buffer } from "buffer";
import Transaction from "arweave/node/lib/transaction";

async function logIn() {
  const userDetails = await Othent.logIn({
    apiId: process.env.NEXT_PUBLIC_OTHENT_API_ID as string,
  });

  console.log("Othent Login details", userDetails);
}

async function logOut() {
  await Othent.logOut({
    apiId: process.env.NEXT_PUBLIC_OTHENT_API_ID as string,
  });

  console.log("Logged out of Othent");
}

const toArrayBuffer = (file: Blob) =>
  new Promise((resolve) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.addEventListener("loadend", (evt) => {
      resolve(evt.target!.result);
    });
  });

function Home() {
  const [files, setFiles] = useState([]);

  function handleFileChange(e: any) {
    setFiles(e.target.files);
  }

  async function createArweaveTransaction() {
    try {
      console.log(files[0]);
      const data = (await toArrayBuffer(files[0])) as ArrayBuffer;
      let creator = "Anon";
      try {
        creator = await window.arweaveWallet.getActiveAddress();
      } catch (e) {}
      const metaData = [
        { name: "Creator", value: creator },
        { name: "Title", value: "Bundlr PNG" },
        { name: "Content-Type", value: "image/png" },
      ];
      const transaction = await createTransaction({
        data,
        type: "data",
        environment: "mainnet",
        options: {
          tags: metaData,
        },
      });
      console.log(transaction);
      const signedTransaction = await signTransaction({
        environment: "mainnet",
        createdTransaction: transaction,
      });
      console.log("Signed", signedTransaction);
      const postedTransaction = await postTransaction({
        environment: "mainnet",
        transaction: signedTransaction as Transaction,
      });
      console.log("Posted", postedTransaction);
      console.log("Posted", transaction.id);
      // Example successful id: https://a6gp5qkf2e6mpljgb5ahyk2nobkgtp2zkdqvh2jc6u7j4occw6ha.arweave.net/B4z-wUXRPMetJg9AfCtNcFRpv1lQ4VPpIvU-njhCt44
    } catch (error: any) {
      console.log("Transaction failed due to:", error.message);
    }
  }

  async function createBundlrTransaction() {
    try {
      console.log(files[0]);
      const data = (await toArrayBuffer(files[0])) as ArrayBuffer;
      let creator = "Anon";
      try {
        creator = await window.arweaveWallet.getActiveAddress();
      } catch (e) {}
      const metaData = [
        { name: "Creator", value: creator },
        { name: "Title", value: "Bundlr PNG" },
        { name: "Content-Type", value: "image/png" },
      ];
      const transaction = await createTransaction({
        data: Buffer.from(data),
        type: "data",
        environment: "mainnet",
        options: {
          tags: metaData,
          useBundlr: true,
          signAndPost: true,
        },
      });
      console.log("Posted", transaction.postedTransaction.id);
      console.log("Posted txn", transaction);
      // Example successful id: https://a6gp5qkf2e6mpljgb5ahyk2nobkgtp2zkdqvh2jc6u7j4occw6ha.arweave.net/B4z-wUXRPMetJg9AfCtNcFRpv1lQ4VPpIvU-njhCt44
    } catch (error: any) {
      console.log("Transaction failed due to:", error.message);
    }
  }

  async function queryGQLTxn() {
    const query = `
query{
  transactions(tags: [
  { name: "Contract-Src", values: ["DG22I8pR_5_7EJGvj5FbZIeEOgfm2o26xwAW5y4Dd14"] }
  ] first: 100) {
edges {
  node {
    id
    owner {
      address
    }
    tags {
      name
      value
    }
    block {
      timestamp
    }
  }
}
}
}

`;

    const res = await queryAllTransactionsGQL(query, {
      gateway: "arweave.net",
      filters: {},
    });

    console.log("This is the result of the query", res);
  }

  return (
    <div className="container flex justify-center pt-12">
      <div className="flex flex-col gap-4 w-1/2">
        <button className="border-4" onClick={logIn}>
          LogIn with Othent
        </button>
        <button className="border-4" onClick={logOut}>
          LogOut with Othent
        </button>
        <input className="border-4" type="file" onChange={handleFileChange} />
        <button className="border-4" onClick={createArweaveTransaction}>
          Create and Post Arweave Transaction
        </button>
        <button className="border-4" onClick={createBundlrTransaction}>
          Create and Post Bundlr Transaction
        </button>
        <button className="border-4" onClick={queryGQLTxn}>
          Query All GQL Transactions
        </button>
      </div>
    </div>
  );
}

export default Home;
