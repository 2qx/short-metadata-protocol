Some thoughts -- copy/pasted from my comments to you on telegram:

---

On RTL: doesn't that arise naturally from the utf8 encoding? no idea tbh i never use rtl languages heh

Why did you break it up into multiple records? just to make it easier on implementations i suspect right? yeah probably.. that's good.. it's easier.

Some things to specify just to make it clear:

- maybe specify what to do if multiple records exist for the same record identifier.. like I see 0x01 twice.. which one "wins"? (presumably the first one but specify it!!)

-  also specify what  an out-of-range record id existing means... like if you encounter 0x04 what to do you do? (presumably ignore it but this needs specification)

- also specify what to do if the OP_RETURN script is not just a bunch of pushes (an op_RETURN script can theoreticallly be any binary data if it's non-standard.. not just pushes!!)

- what to do if the record e.g. 0x00 or 0x01 has more pushes than expected or fewer than expected.. how to treat that should be specified.

- i know you have the concept of "optional" in this spec but specify what a missing value means. does it mean no name? "unnamed"? empty string? ""? the name becomes the "<ticker>"? specify it! also for other optional fields as well .. specify what a missing field means.

---

`Both should be utf8 encoded nad follow BCMR recommendations.` <-- typo on `nad`

---

Aso for the record-id's

- what does <0x00> mean? is that a script number or literally a 1-byte push of the byte '\0'?
- what does <0x01> mean? is that a script number or literally a 1-byte push of the bytes '\1'? 

These two things are different!!! Please specify it!! 

Pick one -- either it's a script number or it's a 1-byte push.. pick one!  I can see arguments for it being a script number.. and arguments for it being a 1-byte push.  maybe ask around which is better for people.

Speaking of which:

The <decimals> field.. what is the encoding on that? is it a script number? is it a raw byte? is it a 4-byte little endian signed integer?! what is it?! specify it!

What is `<enumerator>`.. it's a unique number.. unique with respect to what exactly??!? Is this some sort of GUID? if so .. expand on that and specify what it means and what happens if it's not actually unique!! Or is it unique just in the txn?!?

---

Also what happens if a txn generates several new token category-id's in 1 transaction?!? (this is supported by BCH but most wallets don't bother due to the UI hassle that involves). To which newly-generated token does this metadata apply? the first one encountered? the last? all of them at once? Specify it!

---

Also -- what about NFTs? it seems people like to give NFT's unique names and icons.. want to expand the spec to also encompass metadata for NFTs?