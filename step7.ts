import { mnemonicToWalletKey } from 'ton-crypto'
import { WalletContractV4 } from 'ton'
import * as dotenv from 'dotenv'

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
}

main()
