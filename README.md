# CHIP-SMP: Short Metadata Protocol

        Title: Short Metadata Protocol
        Type: Standards
        Layer: Applications
        Maintainer: 2qx 
        Status: Draft
        Initial Publication Date: 2024-04-26
        Latest Revision Date: 2024-05-22
        Version: 0.3


## Summary

A protocol for broadcasting authenticated metadata on-chain.

## Deployment

This proposal does not require coordinated deployment. 

## Motivation 

Contracts issuing tokens in an autonomous way may find it difficult to sign a json string, maintain a domain or update a registry repository. For contracts to routinely and autonomously issue tokens with metadata, it may be nice to have a suitable format where a contract may specify metadata requirements itself.

Likewise, non-technical users may also want to easily broadcast token data to the network with an ultra low barrier to entry―a low floor, with a low ceiling. If a token issuer has several hundred satoshis in their wallet, they might easily satisfy the barrier and publish a metadata record in a few seconds from a phone or SPV wallet—which can start their journey.

## Overview

This is a schema to record metadata on-chain at minting in a data-carrier output. It is not a replacement for [Bitcoin Cash Metadata Registries (BCMR)](https://cashtokens.org/docs/category/metadata-registries-chip), rather it is short and limited alternative for BitcoinScript, as transpiled from a higher-level syntax like [CashScript](https://cashscript.org).  

Prunable data-carrier output messages have proved very useful for similar problems.  Token Metadata can be recorded by the minting transaction and implicitly authenticated simultaneously by the minting process.

## Benefits

The aim of this proposal is to provide a minimal mechanism for a contract, or user, to store several hundred bytes of information in a fast and cost effective way, with a very low barrier to entry. 

In 2024, op_return data is stored and propagated by many nodes; so a common format to store metadata would give contracts and users a way to mint tokens with metadata in a decentralized way, storing the data at the cost of 1 sat/byte for the near future. 


## Specification

Record length will be constrained by the prevailing limit on data-carrier size (currently 255 bytes). All data-carrier outputs begin with the same operation code `0x6a` or OP_RETURN.


The following scheme is proposed:

    0x6a <SMP0> <meta> <data1> ... <data#> 

Records have a common identifier, followed by a two-byte custom mapping field, followed then by the data to associated with the token, where each `<data>` is delimited in PushByte notation (`length data`) and the order is fixed based on the type of record.


Each record must be prefixed with the protocol identifier mapped to four byte "SMP0" and prepended with the length in bytes, i.e. `0x04 534D5030`

### Meta mapping tags

A special two-byte `<meta>` tag is used to specify which records go with which data of a transaction. 

Bits 0-3 of the `<meta>` record indicate whether it refers to a genesis transaction (an input) or a later NFT mint (an output).

Bits 4-7 indicate the record type.

The second **byte** of the `<meta>` record indicates the index of the input (or output) the record refers to, up to the 255th input or output.  


| #   |   `<meta>` | Custom two-byte meta mapping field                            |
| --- | ---------: | ------------------------------------------------------------- |
| 0   |  `genesis` | Boolean, true (1) if genesis token mint, range `0-1`          |
| 1   |     `type` | Selector indicating the type of record `0-3` (see: type enum) |
| 2-3 | `position` | The index of the input/output being linked `00-FF` 255        |

Where, the type of data fields available are enumerated below:

| `type` |     Type | Fields                              | Many |
| -----: | -------: | ----------------------------------- | ---- |
|    `0` |   Ticker | `<symbol> <enumerator> <decimals>`  | no   |
|    `1` |     Name | `<name> <description>`              | no   |
|    `2` |      Uri | `<tag> <value>`                     | yes  |
|    `3` | Parsable | `<bytecode> <field1> ... <fieldx#>` | no   |


For example, to record an icon of a fungible token created from the seventh input, the `<meta>` tag would be `0x02 1207`, 

In binary, the example above is as follows:

    // 0x1207
    //
    // Genesis, Name record  
    0001 0001 
    // Referencing the 8th input, input[7]
    0000 1000


#### More Meta Tag Examples:

Below are some examples of `<meta>` tags, and a short description of what the record would reference.

| `<meta>` | Example Record Metadata                          |
| -------: | ------------------------------------------------ |
|   `0000` | Symbol and custom enumerator for NFT at output 0 |
|   `0102` | Name and description for NFT at output 2         |
|   `0220` | Uri record for the 32th NFT output               |
|   `1000` | Symbol for NFT series created from input 0       |
|   `1000` | Symbol, decimal place for FT from input 0        |
|   `1100` | Name and description FT from input 0             |
|   `1200` | Icon (or url) of FT minted at  input 0           |
|   `1120` | Name of record the FT created from input 31      |
|   `1120` | Name of record the FT created from input 31      |
|   `1002` | Ticker for FT minted from input 2                |
|   `0302` | Code for parsing NFT Commitment of output 2      |
|   `1300` | Parsing information for NFT series from input 0  |

The meta tag encoding is not very space efficient, but aims to be human readable, easy to implement, and to saving two PushByte codes in the process.

### Ticker Records


| Fields         | Token Supply Record                                   |
| -------------- | ----------------------------------------------------- |
| `<symbol>`     | The ticker symbol in utf-8                            |
| `<enumerator>` | A unique number, or identifier                        |
| `<decimals?>`  | The number of decimals to display (0-19). (Fungibles) |


 The `symbol` should conform to the [Guidelines for Token Issuers](https://cashtokens.org/docs/bcmr/chip#guidelines-for-token-issuers) in BCMR for uniformity. Tickers MUST contain only capital letters, numbers, and hyphens. A `symbol` is required in a ticker record; if the field is null or empty, the entire record should be ignored.

 A unique numeric `enumerator` that can be given as a VM Script Number format (A.K.A. CSCriptNum). An enumerator is optional; if the field is null or empty, the field should be ignored. Software implementers should interpret a zero value PushBytes (`0x4c00`) as a zero value.

This proposal allows for issuing mixed number and letter combos, such as `CAMPAIGN2023-21` + `-` + `100`. The `symbol` and `enumerator` should be joined with a hyphen `-` when displayed as one symbol to the user, just as with BCMR. 

If the `decimals` field is provided, it may be used to indicate how many places to display. The field may optionally be included and defaults to `0` if not included. 
 
### Name Records

The `name` and `description` can be encoded in utf-8 delimited with PushBytes format. Both records are optional. If the name for an NFT series has been specified in a genesis transaction, the name record SHOULD NOT be duplicated for each subsequent NFT of a series.

### Uri Records

| Fields          | Uri Record                                             |
| --------------- | ------------------------------------------------------ |
| `<identifier> ` | Identifier for the link, (i.e. `icon`, `web`, `image`) |
| `<value>`       | the link (url)                                         |

[Uri](https://en.wikipedia.org/wiki/Well-known_URI)s such as links to *icons* or *websites* may be expressed with a their own type (`2`) in the record `<meta>` tag. 

The `<identifier>` field MUST be used to indicate what the resource is (`icon` or `web`). The tag should be encoded as unquoted PushByte utf-8 strings. If there is no `<tag>` and the first value of data is a valid URI, it should be discarded from lack of context.

Token issuers should conform to the [BCMR Recommendations](https://cashtokens.org/docs/bcmr/chip#uri-identifiers) for icons and other uri identifiers.

#### URI Variables

The **genesis** transaction for an NFT, or FT series, may utilize 11 variables, all denoted in the URI by dollar signs:

| URI Variable | Data                           |
| ------------ | ------------------------------ |
| $C           | The NFT commitment             |
| $S           | The Symbol                     |
| $E           | The Enumerator                 |
| $[0-7]       | The first 8 parsed data fields |

All variables have fixed-length, one byte, single character names. 

The associated metadata for an NFT series could be denoted by putting the following URI records in the genesis transaction:

    icon: https://example.invalid/$S/$C.png
    image: https://example.invalid/$S/$C.svg
    web: https://example.invalid/$S/$C/details

The `symbol`, `enumerator`  bytecode data MUST refer to data in the genesis transaction. The commitment or parsed data refers to the data obtained from specific NFT sequences or parsed commitment data.

### Parsable Records

| Fields        |                                             |
| ------------- | ------------------------------------------- |
| `<bytecode> ` | Code to push an array of data to a VM stack |
| `<field0>`    | Field name of the top data on the stack     |
| `<field1>`    | name of the next data on the stack          |

Where the `bytecode` represents the VM op_code instructions to read the NFT commitment and push a set of values to the stack, and `field<#>`s are the corresponding field names for that data, descending down the stack. 


## Note for Contract issued Non-fungible Token Issuers 

Token issuers, particularly contract issued NFTs, **SHOULD NOT** utilize this protocol to reiterate or restate the name or number in the NFT commitment. If the number of the NFT is in an immutable commitment, that sequential numeric data is sufficient to specify the NFT number and should not need to be duplicated in an op_return.

Issuers should assume software follows guidelines for [displaying and interpreting commitments](https://cashtokens.org/docs/bcmr/chip#nft-ticker-symbols) and [sequential numbering of NFTs](https://cashtokens.org/docs/bcmr/chip#sequential-nft-commitment-encoding) given by BCMR.

## Further Specification 

### Duplicate records

Multiple name records may exist in one transaction, referencing different genesis inputs or different NFT outputs. Conflicting records exist for the same input, only the first record should be recognized, and the remaining records should be ignored.  

Multiple URI records may exist when specifying different tags (`web`, `icon`), however, for other record types and duplicate tags for the same URI, the second output in a transaction for the same `<meta>` tag should be ignored. 

For example, if the `name` and `description` of a fungible token has already been linked to the first input, any subsequent attempts to specify a `<name>` type metadata for that input should be ignored.

A single `<name>` record is shared across fungible and non-fungible tokens per outpoint. 


### Conditions that invalidate records:

- If an op return does not have the `SRM0` identifier, discard the whole record. 
- If the protocol identifier was not prepended with `0x04` PushBytes, discard the whole record.
- If the second field in the record is not a two-bytes long (`<meta>` tag), discard the whole record.
- If the `<meta.genesis>` record is not in `[0|1]`, discard the whole record.
- If `<meta.type>` is not within the range of types denoted above, discard the whole record.
- If `<meta.position>` is not within `0-255`, discard the whole record.
- If the reference given by `<meta.genesis>` and `<meta.position>` doesn't map to an input or output on the transaction, discard the whole record.
- If a `<ticker.symbol>` record contains characters that are not capital letters, numbers, and hyphens (regular expression: `^[A-Z0-9]+[-A-Z0-9]*$`), discard the whole record.
- If a `<ticker.symbol>` is null (`0x4c00`), discard the whole record.
- For non-genesis record, if a `ticker` record does not have an `enumerator` record, discard the whole record. 
- If a `<uri.identifier>` is NOT an entirely lowercase, alphanumeric strings, with no whitespace or special characters other than dashes, discard the whole record. 
- If a `<uri>` record has a null `value` field, discard the whole record. 
- If a non-genesis `<uri>` record uses a variable or contains a dollar sign, it may be ignored.
- If parsing the record or data from PushBytes fails, discard the whole record.
- If parsing the record does with PushBytes does not result in an empty string, discard the whole record. 
  
### Conditions that do not invalidate records: 

- If more than three fields exist on a `ticker` or more than two fields exist on a `name` or `uri` record, the extra fields should be ignored.
- If a `<ticker.decimals>` is `null`, it should be treated as a zero.
- If a `<name>` record has a `null` description or only one field, the first field should be taken as the name. 
- Implementers should assume that token issuers in the future may have access to longer OP_RETURN limits, and accommodate the longer PushByte `0x4d-0x4e` op_codes.
  
### Null PushData Encoding

Unless otherwise noted, all OP_RETURN data should be prefixed or delimited with it's length, in bytes. Below is an example implementation from `@CashScript/utils` that is used to encoded data passed to `LockingBytecodeNullData()`.

A single length *zero* in PushByte form is given as `0x01 00`. A null length *null* in PushByte form given as `0x4c 00`.

The below two functions are one implementation from CashScript that prefix members of an array with op_codes (`0x01-0x4c`) denoting the length of data in BitcoinScript.   

```javascript
// From CashScript/utils... 
// MIT - Copyright 2019 Rosco Kalis
// https://github.com/CashScript/cashscript/blob/01f9b9bb552c3c4d63b0c7c8f065a0e23b536ca6/packages/utils/src/script.ts#L95C1-L116C2
// For encoding OP_RETURN data (doesn't require BIP62.3 / MINIMALDATA)
export function encodeNullDataScript(chunks: OpOrData[]): Uint8Array {
  return flattenBinArray(
    chunks.map((chunk) => {
      if (typeof chunk === 'number') {
        return new Uint8Array([chunk]);
      }

      const pushdataOpcode = getPushDataOpcode(chunk);
      return new Uint8Array([...pushdataOpcode, ...chunk]);
    }),
  );
}

function getPushDataOpcode(data: Uint8Array): Uint8Array {
  const { byteLength } = data;

  if (byteLength === 0) return Uint8Array.from([0x4c, 0x00]);
  if (byteLength < 76) return Uint8Array.from([byteLength]);
  if (byteLength < 256) return Uint8Array.from([0x4c, byteLength]);
  // see also: https://libauth.org/functions/encodeDataPush.html
  throw Error('Pushdata too large');
}
```

## Example implementations

Below is a sample specification of a SMP0 record in [CashScript](https://cashscript.org)

```javascript
// In CashScript, using the LockingBytecodeNullData helper  
// Specify a FT or NFT mint from the first input with 6 decimals
bytes ticker = new LockingBytecodeNullData([
    0x534D5030,
    0x1000,
    bytes('XAMPL-2023-C'),
    bytes(29304958),
    0x06
]);

// Or the same record as above, directly, 
// which may less unlocking script. 
bytes enumerator = bytes(29304958);
bytes ticker = 0x6a04534d50300210051858414D504C2D323032332D43 + 
               bytes(enumerator.length) + enumerator +
               0x0206;
```

And the corresponding Javascript implementation:
```javascript
            await contract.functions
            .mintTokens()
            ...
            .withOpReturn([
                "SMP0",
                "0x1000",
                "XAMPL-2023-C",
                "0x" + binToHex(bigIntToVmNumber(29304958)),
                "0x06"
            ]).send();
```

The above call makes use of [`bigIntToVmNumber`](https://libauth.org/functions/bigIntToVmNumber.html) from the libauth library directly. 

## Drawbacks

### Immutable records

This proposal relies on metadata being emitted in the minting operation of a token. The authorization "hack" means metadata is immutable, and could not be updated outside the minting operation.

There are many applications where it's useful to have metadata that can be updated, expanded or corrected. The full BCMR specification is recommended there.

### Potential Over-specification 

The Bitcoin Cash Metadata CHIP already outlines standards for [displaying and interpreting commitments](https://cashtokens.org/docs/bcmr/chip#nft-ticker-symbols) and [sequential numbering of NFTs](https://cashtokens.org/docs/bcmr/chip#sequential-nft-commitment-encoding) without additional metadata.

As such, it should **not** be necessary for a contract to record the metadata, ticker or name that would have been readily inferred in a standard way from the NFT commitment itself. The existence of this protocol or derived tooling may invite over-specification. A token issuer may reenter information that would have displayed correctly without extra metadata whatsoever.

### Long-term viability of data carrier messages

Any use of OP_RETURN messages must come with a reminder that purchasing data storage forever with a small one time fee is not a feasible or reasonable system. Neither from an operational nor financial perspective do miners and infrastructure maintainers have an incentive to serve an ever growing set of non-financial data for free. Eventually such data may become expensive to store, or serve, and it is reasonable to assume retrieval of such records may come as some kind of additional service with a cost. 

## Alternative Protocols/Proposals

### Bitcoin Cash Metadata Registries

The [Bitcoin Cash Metadata Registries](https://cashtokens.org/docs/bcmr/chip/) standard is well established and implemented by a growing number of Bitcoin Cash libraries, wallets and sites.

It's probably the most suitable standard for most organizations and token issuers, with many advantages that come with open-ended web-like contexts and tooling.

### Deterministic Token Minting Contracts

It is theoretically possible to construct a contract that is so restricted as to make all subsequent minting of fungible token series entirely deterministic. That is, it may be possible to write a contract where all subsequent transaction hashes (ids, category ids) are known, and the metadata can be calculated in advance even though it may not be possible to mint the tokens yet under consensus rules, according to the rules of the contract. 

However, if new network features were made available in the future, those features might create a new spending pathway and break the deterministic property of the contract.

It may also be very difficult to specific a fully deterministic contract, or test with certainty that is indeed deterministic.

## Stakeholder Responses & Statements

[Stakeholder Responses & Statements &rarr;](stakeholders.md)

## Feedback & Reviews

- [SMP Issues](https://github.com/2qx/short-metadata-protocol/issues)
- [CHIP 2024-05 SMP: Short Metadata Protocol - Bitcoin Cash Research](https://bitcoincashresearch.org/t/chip-2024-05-smp-short-metadata-protocol/1301)
- On TG @a2qx_u... signed with 2qx#72497; 🦇
- [On memo](https://memo.cash/profile/17Rzs3w813zp2JbKRKnvAuZUHUN5uj8U56), signed with 2qx#72497; 🦇

## Acknowledgements

Thank you to the following contributors for reviewing and contributing improvements to this proposal, providing feedback, and promoting consensus among stakeholders:
[Calin Culianu](https://github.com/cculianu)

## Copyright

This document is placed in the public domain.