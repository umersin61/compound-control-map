# Compound Control Map

Independent community research into Institutional Comet permissions, Safe ownership overlap and Compound Governance revocation paths.

**Live site:** https://umersin61.github.io/compound-control-map/

## Scope and conclusion

The reviewed Comet and Configurator governor addresses point to the 3-of-4 Admin Safe. Their CometProxyAdmin is owned by the 4-of-7 Upgrade Safe. Neither Safe includes the Governor Timelock as an owner, and both returned an empty enabled-module list.

No direct Governor revocation path was identified through those reviewed routes. This is a bounded technical finding, corroborated by the public governance discussion, not a complete security audit or a legal conclusion. An actionless resolution does not by itself change contract permissions.

The site deliberately distinguishes contract readings, public descriptions, inference and unknown identity. It does not allege misconduct, identify private individuals, or infer common control from co-membership.

## Files

- `index.html`, `style.css`, `app.js`: dependency-free interactive website.
- `data.json`: research dataset, exact addresses, typed relationships, source links, dates, readings and limitations.
- `data.js`: browser copy of the same dataset.
- `build-data.js`: reproducible dataset authoring script; run `node build-data.js` after editing.

Serve these files with any static web server. For GitHub Pages, select `main` / repository root. No build service, wallet connection, external scripts or analytics are required.

## Method

Read-only Etherscan contract queries and public primary-source research. Principal Safe owner sets, nested Safe ownership, Comet/Configurator governors, proxy ownership and module lists were inspected on 21 September 2026. Some Governor and treasury observations date to 19 September and are explicitly labeled in the ledger. Reads were not pinned to a single block; linked explorer pages show current state and may change.

Names are a separate layer from on-chain addresses. All nine current Community Multisig addresses match the April 2026 public signer register. Unknown organizational and individual attributions are left unknown. The nested Safe’s `compound-dao.eth` explorer label alone does not establish organizational ownership or authority to represent the DAO.

The proposed controller is a conceptual comparison, not deployed or audited software. A final design must ensure delegated upgrades cannot remove governance’s superior authority, and requires a migration authorized by the existing controllers.

## Corrections

Open an issue with the exact address, contract method, block number or transaction when available, and a primary public source for identity claims. Distinguish a change since the observation date from an error in the original observation.

No private communications, wallet secrets, legal strategy or allegations are included in this repository.
