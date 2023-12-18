import { Polkadot } from '@unique-nft/utils/extension'
import type { IPolkadotExtensionAccount } from '@unique-nft/utils/extension'

const accounts: IPolkadotExtensionAccount[] = []

const loadAccounts = async () => {
  try {
    const result = await Polkadot.enableAndLoadAllWallets()
    accounts.push(...result.accounts)
  } catch (e) {
    console.error(e)
  }
}

const getSelectOptions = () => {
  if (accounts.length === 0) {
    const emptyOption = document.createElement('option')
    emptyOption.value = ''
    emptyOption.textContent = 'No accounts found'
    emptyOption.disabled = true

    return [emptyOption]
  }

  return accounts.map((account) => {
    const option = document.createElement('option')
    option.value = account.address
    option.textContent = account.name
    return option
  })
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!navigator.clipboard) return false

  await navigator.clipboard.writeText(text)
  return true
}

let isVisible = false

const render = async () => {
  await loadAccounts()

  const banner = document.createElement('div')
  banner.style.display = 'flex'
  banner.style.flexDirection = 'column'
  banner.style.position = 'fixed'
  banner.style.top = '0'
  banner.style.right = '0'
  banner.style.zIndex = '1000'
  banner.style.padding = '10px'
  banner.style.backgroundColor = '#f0f0f0'
  banner.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'

  const accountSelect = document.createElement('select')
  accountSelect.style.marginBottom = '5px'
  accountSelect.append(...getSelectOptions())

  const textInput = document.createElement('input')
  textInput.type = 'text'
  textInput.style.marginBottom = '5px'

  const copyAddressButton = document.createElement('button')
  copyAddressButton.textContent = 'Copy address'
  copyAddressButton.style.marginBottom = '5px'
  copyAddressButton.onclick = async () => {
    const account = accounts.find((account) => account.address === accountSelect.value)
    if (!account) return

    await copyToClipboard(account.address)

    copyAddressButton.textContent = 'Copied!'
    setTimeout(() => {
      copyAddressButton.textContent = 'Copy address'
    }, 1000)
  }

  const signButton = document.createElement('button')
  signButton.textContent = 'Sign'
  signButton.style.marginBottom = '5px'
  signButton.onclick = async () => {
    const account = accounts.find((account) => account.address === accountSelect.value)
    if (!account) return
    if (!textInput.value) return

    const signerResult = await account.signRaw({
      address: account.address,
      data: textInput.value,
      type: 'bytes'
    })

    textInput.value = signerResult.signature
  }

  const toggleButton = document.createElement('button')
  toggleButton.textContent = 'Tiny signer'
  toggleButton.style.marginBottom = '5px'
  toggleButton.onclick = () => {
    isVisible = !isVisible

    if (isVisible) {
      loadAccounts()

      banner.appendChild(accountSelect)
      banner.appendChild(copyAddressButton)
      banner.appendChild(textInput)
      banner.appendChild(signButton)

      toggleButton.textContent = 'Hide'
    } else {
      banner.removeChild(accountSelect)
      banner.removeChild(copyAddressButton)
      banner.removeChild(textInput)
      banner.removeChild(signButton)

      toggleButton.textContent = 'Tiny signer'
    }
  }

  banner.appendChild(toggleButton)
  document.body.appendChild(banner)
}

render()
