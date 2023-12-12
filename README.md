# Lens verified modules

This repo contains a list of verified modules for Lens. This includes `open actions`, `follow modules` and `reference modules`. Anyone can do a PR to get their modules verified and listed here. Once it is on here, we classify it as safe to use. The verified modules will be able to be used in the lens API for gasless actions; note all modules are indexed and broken back; this is just a second layer of security.

## How to get your module verified

1. Fork this repo
2. Add your module to the correct JSON file

The JSON structure is:

- `name` - The name of your module
- `address` - The address of the module
- `requiresUserFunds` - If the module requires user funds to be used, for example, you're paying to mint an NFT or pay to read more of an article. If this is true, it means signless would work on your module throughout the API. If it is false, then the module is still sponsored for gasless, but it would require a signature from the user to use it due to funds changing hands.
- `blockExplorerLink` - The link to the block explorer for the module

```json
{
  "name": "SimpleCollectOpenActionModule",
  "address": "0x060f5448ae8aCF0Bc06D040400c6A89F45b488bb",
  "requiresUserFunds": true,
  "blockExplorerLink": "https://polygonscan.com/address/0x060f5448ae8aCF0Bc06D040400c6A89F45b488bb#code"
}
```

3. Create a PR and fill it out using the PR template
4. Once the PR is merged, your module will be verified
