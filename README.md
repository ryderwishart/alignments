# alignments

## Usage

```bash
pnpm i
pnpm run dev
```

To build:

```bash
pnpm run build
```

## Splitting large alignments file into expected format

```bash
split -l 11000 complete_bible_fraLSG.jsonl_final_output.jsonl data-chunk-
for file in data-chunk-??; do mv "$file" "$file.jsonl"; done
```
