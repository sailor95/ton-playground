import { mnemonicToWalletKey } from 'ton-crypto'
import { fromNano, TonClient, WalletContractV4 } from 'ton'
import * as dotenv from 'dotenv'
import { getHttpEndpoint } from '@orbs-network/ton-access'

dotenv.config()

async function main() {
  const mnemonic = process.env.SEED || ''
  const key = await mnemonicToWalletKey(mnemonic.split(' '))
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  })

  // Wallet address
  console.log(wallet.address.toString({ testOnly: true }))

  // Wallet workchain
  console.log('workchain:', wallet.address.workChain)

  const endpoint = await getHttpEndpoint({ network: 'testnet' })
  const client = new TonClient({ endpoint })

  const balance = await client.getBalance(wallet.address)
  console.log('Balance:', fromNano(balance))

  const walletContract = client.open(wallet)
  const seqno = await walletContract.getSeqno()
  console.log('seqno:', seqno)
}

main()
