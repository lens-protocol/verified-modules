# Lens verified modules

This repo contains a list of verified modules for Lens. This includes `open actions`, `follow modules` and `reference modules`. Anyone can do a PR to get their modules verified and listed here. Once it is on here we class it as safe to be used. The verified modules will be able to be used in the lens API for gasless actions, note all modules are indexed and broke back this is just a second layer of security.

## How to get your module verified

1. Fork this repo
2. Add your module to the correct json file

The json structure is:

- `name` - The name of your module for easy scanning of folder
- `address` - The address of the module
- `requiresUserFunds` - If the module requires user funds to be used for example your paying to collect an NFT or pay to read more of an article
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
4. Once the PR is merged your module will be verified
