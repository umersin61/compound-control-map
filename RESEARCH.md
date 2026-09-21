# Evidence notes — 21 September 2026

This file documents review coverage and open items. The machine-readable ledger in `data.json` contains exact owner arrays, addresses and observation dates.

## Directly refreshed

- Admin Safe: 3/4, exact owners, empty enabled-module list.
- Upgrade Safe: 4/7, exact owners, empty enabled-module list.
- TMC: 4/6, exact owners.
- Community Multisig: 5/9, exact owners.
- Nested `compound-dao.eth` Safe: 2/3, exact owners; explorer-displayed ENS label.
- Institutional Comet: `governor()` is the Admin Safe.
- Configurator: `governor()` is the Admin Safe; `marketAdminPermissionChecker()` is zero.
- CometProxyAdmin: `owner()` is the Upgrade Safe; permission checker is zero. `getProxyAdmin()` returns this administrator for both Comet and Configurator.
- Treasury Timelock: `hasRole(DEFAULT_ADMIN_ROLE, GovernorTimelock)` is true. Proposer and executor membership for the TMC was also refreshed successfully.

Reads were performed through the Etherscan read-contract interface, without connecting a wallet. They were not pinned to one block and are not immutable historical attestations. September 19 observations for the Governor, escrow, Avatar and treasury cancellation role are explicitly carried forward rather than represented as freshly checked.

## Identity attribution coverage

The April 2026 Community Multisig register identifies all nine current owners and matches the live owner array. It maps `FC63…` to Gauntlet, `d2A7…` to WOOF, and the remaining addresses to ZeroShadow, Certora, ChainSecurity, PGov, Michael Lewellen, 0age and arr00. Prior signer names were not carried forward across address rotations without a current attribution.

The TMC transparency update explicitly names Victor / Platonia and the exact `aA9D…` address. allthecolors publicly self-attested the `66cD…` address in the 2022 grants thread; the signature was not independently recovered here.

Exact-address searches, public forum signer/treasury/security-provider records, deployment material and explorer labels did not establish supported identities for `0660…`, `671b…`, `FcFf…`, `9963…` or `f5e6…`. The nested owners `B8Dc…` and `3d0e…` also remain unattributed. Explorer pages for `671b…`, `FcFf…` and `9963…` showed no public identity label or outgoing transaction history at inspection. This does not imply a key is unused: Safe signatures need not originate an Ethereum transaction.

Exchange funding, transaction submission, code deployment or participation in the same Safe was not treated as proof of identity. The organization behind `compound-dao.eth` is unresolved: an ENS/explorer label alone is not evidence of a CGWG mandate or authority to represent the DAO.

## Organizational links

The public Institutional Comet discussion describes Foundation, CGWG, security-provider and Gauntlet constituencies. It does not supply a complete exact-key mapping for those constituencies. The map therefore does not assign the remaining keys by elimination.

CGWG renewal material names Arana Digital and PGov and describes PGov’s Community Multisig coordination role. The joint security-provider proposal describes ChainSecurity/Certora responsibilities. These are documented organizational relationships, not proof of shared key custody.

## Unresolved technical items

- A fresh displayed result for Institutional Comet `pauseGuardian()` was not obtained. The map uses the deployment configuration as DOCUMENTED evidence for that edge.
- Full Safe guard, fallback-handler, implementation/storage and signature-validation audits were not performed. Empty module lists establish the absence of enabled modules at the observed state, not the security of every execution route.
- The map does not enumerate all treasury assets, every wallet associated with a service provider, or every protocol contract.
- Treasury proposal language described an upgradeable design. The site instead relies on the deployed administrator role and does not claim proxy upgradeability.
- The proposed controller is a functional requirement, not reviewed code. All privileged upgrade routes must preserve governance’s ultimate revocation authority.

## Validation

Checked address format, source/edge integrity, overlap arithmetic and unknown-identity counts. Browser checks cover model switching, graph filters, signer drawers, nested owners, search, the shared-owner matrix and a narrow-screen layout. No wallet operations were performed.
