import { ingestHFDataset } from "../scripts/ingest-hf-dataset";

async function main() {
  await ingestHFDataset();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
