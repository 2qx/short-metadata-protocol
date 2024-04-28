# CHIP-2024-04-SMP:  Short Metadata Protocol 

        Title: Short Metadata Protocol
        Type: Standards
        Layer: Applications
        Maintainer: 2qx 
        Status: Draft
        Initial Publication Date: 2024-04-26
        Latest Revision Date: 2024-04-26
        Version: 0.1

## Summary

A standard for broadcasting authenticated metadata on-chain.

## Deployment

This proposal does not require coordinated deployment. 

## Motivation 

Contracts issuing tokens in an autonomous way may find it difficult to sign a json string, maintain a domain or update a registry repository. For contracts to routinely and autonomously issue tokens with metadata, it may be nice to have a suitable format where a contract may specify that itself.

## Specification

This is a schema to record metadata on-chain at minting in a data-carrier output. It is not a replacement for [Bitcoin Cash Metadata Registries (BCMR)](https://cashtokens.org/docs/category/metadata-registries-chip), rather it is short and limited alternative for BitcoinScript.  

Token Metadata can be recorded by the zeroth-descendant transaction chain of a minting transaction. The metadata is authenticated simultaneously with the token mint by the NFT baton.

Prunable data-carrier outputs messages have proved very useful for similar problems. The following scheme is proposed:

    0x6a SMP <version> <0x00> <ticker> <identifier> <decimals>
    0x6a SMP <version> <0x01> <name> <rtl?>
    0x6a SMP <version> <0x02> <icon>
    0x6a SMP <version> <0x03> <web>

with every record is give in PushBytes notation (`<length data>`),

Where: 

|                | fields                                                                               |
| -------------: | ------------------------------------------------------------------------------------------- |
|     `0x534D50` | Short Message Protocol identifier (SMP)                                                     |
|    `<version>` | Protocol version                                                                            |
|          `<i>` | Selector indicating the type of record `0x00`-`0x04`                                        |
|     `<ticker>` | The ticker in ASCII                                                                         |
| `<enumerator>` | A unique number, (Script Number encoded)                                                    |
|   `<decimals>` | The number of decimals to display (0-19)                                                    |
|      `<name?>` | Name (utf8)  (optional)                                                                     |
|       `<rtl?>` | Attempt to display name right-to-left (optional)                                            |
|      `<icon?>` | Icon URI [per BCMR Specs](https://cashtokens.org/docs/bcmr/chip#uri-identifiers) (optional) |
|       `<web?>` | Website [per BCMR Specs](https://cashtokens.org/docs/bcmr/chip#uri-identifiers) (optional)  |

Base records are denoted with a zero selector `0x00`.

 The `ticker` should conform to the [Guidelines for Token Issuers](https://cashtokens.org/docs/bcmr/chip#guidelines-for-token-issuers) in BCRM for uniformity. If tickers contain only capital letters, numbers, and hyphens, they can be well accommodated by common ascii.

 With `enumeration`, the most the Bitcoin VM uses is Script Number format (A.K.A. CSCriptNum) internally. So without having to convert ot a text encoding, software reading this protocol should build the full display ticker by joining the ticker with the enumerator converted to a whole number.

This proposal would still allow for issuing mixed number and letter combos, such as `CAMPAIGN2023-21-100`, by providing mixed content as ascii in the ticker and incrementing the identifier at the end: `CAMPAIGN2023-21` + `-` + `100`

 The `decimals` to display are the next byte.
 
 ## Optional records

A printable token name may be optionally specified with a separate op_return using the `0x01` selector.

The  `<name>` should be given in utf8 encoding, aligning with BCMR. 

Optionally, if applications should attempt to render the token name in right-to-left, `rtl`  should be indicated with an additional true (`0x01`) following the name.

Both the an icon and web link may specified with selectors (`0x02`, `0x03` respectively). Both should be utf8 encoded nad follow BCMR recommendations. 