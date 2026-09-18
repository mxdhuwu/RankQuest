async function check() {
  const url = "https://huggingface.co/datasets/soughed/jee-main-questions/raw/main/mathematics/train.jsonl";
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.includes("M-01-Q11")) {
      console.log("RAW M-01-Q11:");
      console.log(line);
      break;
    }
  }
}
check();
