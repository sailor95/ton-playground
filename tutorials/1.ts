import { mnemonicToWalletKey } from 'ton-crypto'
import { fromNano, TonClient, WalletContractV4, internal } from 'ton'
import * as dotenv from 'dotenv'
import { getHttpEndpoint } from '@orbs-network/ton-access'

dotenv.config()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  const mnemonic = process.env.SEED || ''
  const { publicKey, secretKey } = await mnemonicToWalletKey(
    mnemonic.split(' ')
  )
  const wallet = WalletContractV4.create({
    publicKey,
    workchain: 0,
  })
  // Initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: 'testnet' })
  const client = new TonClient({ endpoint })
  const balance = await client.getBalance(wallet.address)
  const walletContract = client.open(wallet)
  const seqno = await walletContract.getSeqno()

  if (!(await client.isContractDeployed(wallet.address))) {
    console.log('Wallet is NOT deployed')
    return
  }

  console.log('Address:', wallet.address.toString({ testOnly: true }))
  console.log('Workchain:', wallet.address.workChain)
  console.log('Balance:', fromNano(balance))
  console.log('Seqno:', seqno)

  /**
   * Privileged actions below (need private key)
   */

  await walletContract.sendTransfer({
    secretKey,
    seqno,
    messages: [
      internal({
        to: 'EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI',
        value: '0.001',
        body: 'Hello!',
        bounce: false,
      }),
    ],
  })

  let currentSeqno = seqno
  while (currentSeqno == seqno) {
    console.log('Waiting for transaction to confirm')
    await sleep(1500)
    currentSeqno = await walletContract.getSeqno()
  }
  console.log('Transaction confirmed!')
  console.log('New seqno:', currentSeqno)
}

main()
