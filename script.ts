import { readLines } from "https://deno.land/std@0.180.0/io/mod.ts";

async function readIgnores() {
    const ignores = await Deno.readTextFile(".ignore");
    return ignores.split("\n").filter((line) => line.trim() !== "");
}

function shouldDeleteLine(line: string) {
    return line.includes("eslint-disable");
}

async function deleteLinesFromFile(path: string) {
    // 出力ファイルの内容を初期化
    const output: string[] = [];

    // ファイルを一行ずつ読み込む
    const file = await Deno.open(path, { read: true });
    for await (const line of readLines(file)) {
        // 条件に応じて行をスキップ
        if (!shouldDeleteLine(line)) {
            output.push(line);
        }
    }
    file.close();
}

async function readFilesRecursively(dir = ".", ignores: string[] = []) {
    for await (const entry of Deno.readDir(dir)) {
        const path = `${dir}/${entry.name}`;

        // Skip if the path is in the ignore list
        if (ignores.some((ignore) => path.includes(ignore))) {
            continue;
        }

        if (entry.isFile) {
            await deleteLinesFromFile(path);
        } else if (entry.isDirectory) {
            await readFilesRecursively(path);
        }
    }
}

const ignores = await readIgnores();
const targetDir = Deno.args[0];
await readFilesRecursively(targetDir, ignores);
