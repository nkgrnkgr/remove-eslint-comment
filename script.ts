async function readIgnores() {
    const ignores = await Deno.readTextFile(".ignore");
    return ignores.split("\n").filter((line) => line.trim() !== "");
}

async function readFilesRecursively(dir = ".", ignores: string[] = []) {
    for await (const entry of Deno.readDir(dir)) {
        const path = `${dir}/${entry.name}`;

        // Skip if the path is in the ignore list
        if (ignores.some((ignore) => path.includes(ignore))) {
            continue;
        }

        if (entry.isFile) {
            const data = await Deno.readTextFile(path);
            console.log(path, data.length);
        } else if (entry.isDirectory) {
            console.log(path);
            await readFilesRecursively(path);
        }
    }
}

const ignores = await readIgnores();

const targetDir = Deno.args[0];
await readFilesRecursively(targetDir, ignores);
