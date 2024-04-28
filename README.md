# NOT FOR REVIEW, AWIP - CHIP-SMP0: Short Metadata Protocol 

        Title: Short Metadata Protocol
        Type: Standards
        Layer: Applications
        Maintainer: 2qx 
        Status: Draft
        Initial Publication Date: 2024-04-26
        Latest Revision Date: 2024-04-26
        Version: 0.2


## Summary

A standard for broadcasting authenticated metadata on-chain.

## Deployment

This proposal does not require coordinated deployment. 

## Motivation 

Contracts issuing tokens in an autonomous way may find it difficult to sign a json string, maintain a domain or update a registry repository. For contracts to routinely and autonomously issue tokens with metadata, it may be nice to have a suitable format where a contract may specify metadata requirements itself.

## Overview

This is a schema to record metadata on-chain at minting in a data-carrier output. It is not a replacement for [Bitcoin Cash Metadata Registries (BCMR)](https://cashtokens.org/docs/category/metadata-registries-chip), rather it is short and limited alternative for BitcoinScript, as transpiled from a higher-level syntax like [CashScript](https://cashscript.org).  

Prunable data-carrier outputs messages have proved very useful for similar problems.  Token Metadata can be recorded by the minting transaction and implicitly authenticated simultaneously by the minting process.

## Specification

Record length will be constrained by the prevailing limit on data-carrier size (currently 255 bytes). All data-carrier outputs begin with the same operation code `0x6a` or OP_RETURN.


The following scheme is proposed:

    0x6a <SMP0> <meta> <data1> ... <dataX> 

Records have a common identifier, followed by a four-byte custom mapping field, then followed by the data to associated with the token, where each `<data>` is delimited in PushByte notation (`length data`) and the order is fixed based on the type of record.


Each record must be prefixed with the protocol identifier mapped to four byte ASCII hexidecimal and prepended with the length in bytes, i.e. `0x04 534D5030 // "SMP0"`

### Meta mapping tags

A special four-byte `<meta>` tag is used to specify which records go with which outputs in a transaction. 

| byte |  `<meta>` | Custom four-byte meta mapping field                    |
| ---- | --------: | ------------------------------------------------------ |
| 0    | `genesis` | Boolean, true if genesis token mint, range `0-1`       |
| 1    |    `type` | Selector indicating the type of record `0-F`           |
| 2-3  |  `in/out` | The index of the input/output being linked `00-FF` 255 |

Where, the type of data fields available are enumerated below:

| `type` |     Type | Fields                             |
| -----: | -------: | ---------------------------------- |
|    `0` | Fungible | `<ticker> <identifier> <decimals>` |
|    `1` |     Name | `<name> <description>`             |
|    `2` |      Uri | `<tag> <value>`                    |
|        |   Script | TODO? parse.bytecode               |

 [TODO check parse.bytecode case](https://cashtokens.org/docs/bcmr/chip#rendering-nfts-in-user-interfaces) 

For example, to record an icon of a fungible token created from the seventh input, the `<meta>` tag would be `0x02 1207`, where the Name for an *NFT* on the fourth *output* from an existing category would be tagged `0x02 0104`, 


### Fungible Token Supply Records


| Fields         | Token Supply Record                      |
| -------------- | ---------------------------------------- |
| `<ticker>`     | The ticker in ASCII                      |
| `<enumerator>` | A unique number, (Script Number encoded) |
| `<decimals?>`  | The number of decimals to display (0-19) |


 The `ticker` should conform to the [Guidelines for Token Issuers](https://cashtokens.org/docs/bcmr/chip#guidelines-for-token-issuers) in BCMR for uniformity. Tickers *should* contain only capital letters, numbers, and hyphens. A ticker is optional; if the field is null or empty, the entire record should be ignored.

 A unique numeric `enumerator` given in Script Number format (A.K.A. CSCriptNum). An enumerator is optional; if the field is null or empty, the entire record should be ignored. Software implementers should interpret a zero value PushBytes (`0x00`) as a null value.

This proposal allows for issuing mixed number and letter combos, such as `CAMPAIGN2023-21` + `-` + `100`. The `ticker` and `enumerator` should be joined with a hyphen `-` when displayed as one symbol to the user, just as with BCMR. 

If the `decimals` field is provided, it may be used to indicate how many places to display.
 
### Name Records

The name and description [TBD]

### Uri Records

| Fields          | Uri Record                                             |
| --------------- | ------------------------------------------------------ |
| `<identifier> ` | Identifier for the link, (i.e. `icon`, `web`, `image`) |
| `<value>`       | the link                                               |

[Uri](https://en.wikipedia.org/wiki/Well-known_URI)s such as links to *icons* or *websites* may be expressed with a their own type (`2`) in the record `<meta>` tag. 

The `<identifier>` field **must** be used to indicate what the resource is (`icon` or `web`). The tag should be encoded as unquoted PushByte ASCII strings. If there is no `<tag>` and the first value of data is a valid URI, it should be discarded without context.

Token issuers should conform to the [BCMR Recommendations](https://cashtokens.org/docs/bcmr/chip#uri-identifiers) for icons and other uri identifiers.

**Unlike** BCMR, Uris should be accepted in both utf8 and ascii encodings.

## Further Specification 

non-existent records

Duplicate records on one transaction.


## Stakeholder Responses & Statements

[Stakeholder Responses & Statements &rarr;](stakeholders.md)

## Feedback & Reviews

- [CashTokens CHIP Issues](https://github.com/2qx/short-metadata-protocol/issues)
- [`CHIP SMP` - Bitcoin Cash Research] https://bitcoincashresearch.org/ TBD

## Acknowledgements

Thank you to the following contributors for reviewing and contributing improvements to this proposal, providing feedback, and promoting consensus among stakeholders:
[Calin Culianu](https://github.com/cculianu)

## Copyright

This document is placed in the public domain.