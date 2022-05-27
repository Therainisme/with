export function compileMarkdown(str: string): [string, Map<string, string>] {
    // yaml formatter
    const formatter = new Map();

    if (str == "") return ["", formatter];

    // 一行一行的匹配
    let rows = str.split("\n");
    let matchArray;
    let html = "";
    for (let i = 0, len = rows.length; i < len; i++) {
        const increment = () => {
            return ++i;
        };

        matchArray =
            // 匹配标题
            // ^A : 以 A 开头
            rows[i].match(/^#\s/)
            || rows[i].match(/^##\s/)
            || rows[i].match(/^###\s/)
            || rows[i].match(/^####\s/)
            || rows[i].match(/^#####\s/)
            || rows[i].match(/^######\s/)

            // \*{3,} ： 至少出现 3 个星号
            || rows[i].match(/^\*{3,}/)

            // 缩进块（引用）
            || rows[i].match(/^>\s/)

            // 无序列表
            || rows[i].match(/^\*\s/)

            // 有序列表
            || rows[i].match(/^\d\.\s/)

            // 代码块
            // ^```：
            || rows[i].match(/^```/)

            || rows[i].match(/^---/)

            // 表格
            // ^\|.*\|：以 | 开头，匹配到 | 结束，中间无数个任意字符
            || rows[i].match(/^\|.*\|/);


        if (matchArray) {
            // ['## ', index: 0, input: '## 0x3f3f3f3f\r', groups: undefined]
            switch (matchArray[0]) {
                // 匹配 --- 之间的信息
                case "---":
                    parseYamlFormatter(rows, formatter, increment);
                    break;

                // 匹配六级标题
                case "# ":
                    html += `<h1>${formatMarkdown(rows[i].substring(2))}</h1>`;
                    break;
                case "## ":
                    html += `<h2>${formatMarkdown(rows[i].substring(3))}</h2>`;
                    break;
                case "### ":
                    html += `<h3>${formatMarkdown(rows[i].substring(4))}</h3>`;
                    break;
                case "#### ":
                    html += `<h4>${formatMarkdown(rows[i].substring(5))}</h4>`;
                    break;
                case "##### ":
                    html += `<h5>${formatMarkdown(rows[i].substring(6))}</h5>`;
                    break;
                case "###### ":
                    html += `<h6>${formatMarkdown(rows[i].substring(7))}</h6>`;
                    break;

                // 匹配 *****
                case rows[i].match(/^\*{3,}/) && rows[i].match(/^\*{3,}/)![0]:
                    html += rows[i].replace(/^\*{3,}/g, '<hr>');
                    break;

                // 匹配引用 > 如果有多行引用则合并
                case "> ":
                    html += compileBlockquote(rows, i, increment);
                    break;

                // 匹配无序列表 * 无序列表
                case "* ":
                    html += compileUnorderList(rows, i, increment);
                    break;

                // 匹配有序列表 1. 有序列表
                case rows[i].match(/^\d\.\s/) && rows[i].match(/^\d\.\s/)![0]:
                    html += compileOrderList(rows, i, increment);
                    break;

                // 匹配多行代码块
                case "```":
                    html += compileCodeBlock(rows, increment);
                    break;

                // 匹配万恶的表格
                case rows[i].match(/^\|.*\|/) && rows[i].match(/^\|.*\|/)![0]:
                    html += compileTable(rows, i, increment);
                    break;
            }
        } else {
            html += compileUnmatch(rows[i]);
        }
    }

    return [html, formatter];
}

/**
 * 这个部分专门用于匹配行内可能出现的 Markdown 标记
 */
function formatMarkdown(str: string): string {
    str = str.replace(/\s/g, " ");

    // 匹配粗体 **...**
    // \*{2}: 出现两个星号
    // [^*]: 不是星号的一个字符
    // .*: 多个任意字符
    // ?: 如果紧跟在任何量词 *、 +、? 或 {} 的后面，将会使量词变为非贪婪（匹配尽量少的字符）
    // ?: 这样就可以一行匹配多个粗体了
    // \*{2}: 出现两个星号
    let bold = str.match(/\*{2}[^*].*?\*{2}/g);
    if (bold) {
        for (let i = 0, len = bold.length; i < len; i++) {
            str = str.replace(bold[i], "<b>" + bold[i].substring(2, bold[i].length - 2) + "</b>");
        }
    }

    // 匹配斜体，与粗体同理，*...*
    let italic = str.match(/\*[^*].*?\*/g);
    if (italic) {
        for (let i = 0, len = italic.length; i < len; i++) {
            str = str.replace(italic[i], "<i>" + italic[i].substring(1, italic[i].length - 1) + "</i>");
        }
    }

    // 匹配删除，与粗体、斜体同理，~~...~~
    let del = str.match(/~{2}[^*].*?~{2}/g);
    if (del) {
        for (let i = 0, len = del.length; i < len; i++) {
            str = str.replace(del[i], "<del>" + del[i].substring(2, del[i].length - 2) + "</del>");
        }
    }

    // 匹配行内代码块 `code`
    let code = str.match(/`.+?`/g);
    if (code) {
        for (let i = 0, len = code.length; i < len; i++) {
            str = str.replace(code[i], "<code>" + code[i].substring(1, code[i].length - 1) + "</code>");
        }
    }

    // 匹配图片 ![...](...)
    let img = str.match(/!\[.*?\]\(.*?\)/g);
    let re1 = /\(.*?\)/;
    let re2 = /\[.*?\]/;
    if (img) {
        for (let i = 0, len = img.length; i < len; i++) {
            let url = img[i].match(re1)![0];
            let title = img[i].match(re2)![0];
            str = str.replace(img[i], "<img src=" + url.substring(1, url.length - 1) + " alt=" + title.substring(1, title.length - 1) + ">");
        }
    }

    // 匹配链接 [...](...)
    let a = str.match(/\[.*?\]\(.*?\)/g);
    if (a) {
        for (let i = 0, len = a.length; i < len; i++) {
            // 匹配 [...]
            // 匹配 (...)
            let url = a[i].match(re1)![0];
            let title = a[i].match(re2)![0];
            str = str.replace(a[i], "<a href=" + url.substring(1, url.length - 1) + ">" + title.substring(1, title.length - 1) + "</a>");
        }
    }

    return str;
}

/**
 * 我当时在代码块里写了一个 `#include <bits/stdc++.h>`
 * 它只给我显示 `#include`，给我干麻了
 */
function escapeHTML(str: string): string {
    return str.replace(
        /[&<>'"]/g,
        tag => ({
            "&": `&amp;`,
            "<": `&lt;`,
            ">": `&gt;`,
            "'": `&#39;`,
            "\"": `&quot;`,
        }[tag] || tag)
    );
}

/**
 * 获取 Yaml formatter
 */
export async function getYamlFormatter(content: string): Promise<Map<string, string>> {
    const formatter = new Map();

    const re = /^---/;
    let rows = content.split("\n");
    for (let i = 0, len = rows.length; i < len; i++) {
        const matchArr = rows[i].match(re);
        if (matchArr && matchArr[0] === `---`) {
            i++;
            while (i < len && !re.test(rows[i])) {
                const KV = rows[i].split(":");
                formatter.set(KV[0].trim(), KV[1].trim());
                i++;
            }
            i++;
        }
    }

    return formatter;
}

/**
 * 
 * 解析 yaml formatter
 * 
 * ```
 * ---
 * title: markdown 基本语法
 * date: 2022-5-27
 * ---
 * ```
 * 
 * 第一行和最后一行跳过。
 * 中间以: spilt，获取 KV 存储到 Map 中。
 */
function parseYamlFormatter(rows: string[], formatter: Map<string, string>, increment: () => number) {
    const re = /^---/;
    for (let i = increment(), len = rows.length; i < len && !re.test(rows[i]); i = increment()) {
        const KV = rows[i].split(":");
        formatter.set(KV[0].trim(), KV[1].trim());
    }
    increment();
    return;
}

/**
 * 
 * 编译有序列表
 * 
 * ```
 * 1. item1
 * 2. item2
 * 3. item3
 * ```
 * 
 * 第 1 行 > 1. XXX，XXX 加入到结果里。
 * 第 i + 1 行，如果还是无序列表，重复上面的步骤。
 */
function compileOrderList(rows: string[], nowIdx: number, increment: () => number): string {
    let html = "";

    let ol = "";
    let re = /^\d\.\s/;
    for (let i = nowIdx, len = rows.length; i < len && rows[i].match(re);) {
        ol += "<li>" + formatMarkdown(rows[i].substring(3, rows[i].length)) + "</li>";
        i = increment();
    }
    html += `<ol>${ol}</ol>`;

    return html;
}

/**
 * 
 * 编译无序列表
 * 
 * ```
 * * item1
 * * item2
 * * item3
 * ```
 * 
 * 现在只匹配了 *。
 * 第 1 行 > * XXX，XXX 加入到结果里。
 * 第 i + 1 行，如果还是无序列表，重复上面的步骤。
 */
function compileUnorderList(rows: string[], nowIdx: number, increment: () => number): string {
    let html = "";

    let ul = "";
    let re = /^\*\s/;
    for (let i = nowIdx, len = rows.length; i < len && rows[i].match(re);) {
        ul += "<li>" + formatMarkdown(rows[i].substring(2, rows[i].length)) + "</li>";
        i = increment();
    }
    html += `<ul>${ul}</ul>`;

    return html;
}

/**
 * 
 * 编译引用块
 * 
 * ```
 * > 可以多行引用
 * > 但是现在无法匹配多层引用
 * ```
 * 
 * 第 1 行 > XXX，XXX 加入到结果里。
 * 第 i + 1 行，如果还是引用块，重复上面的步骤。
 */
function compileBlockquote(rows: string[], nowIdx: number, increment: () => number): string {
    let html = "";

    let blockquote = "";
    let re = /^>\s/;
    for (let i = nowIdx, len = rows.length; i < len && rows[i].match(re);) {
        blockquote += "<p>" + formatMarkdown(rows[i].substring(2, rows[i].length)) + "</p>";
        i = increment();
    }
    html += `<blockquote>${blockquote}</blockquote>`;

    return html;
}

/**
 * 编译多行代码块
 * 
 * ```
 * #include <bits/stc++.h>
 * using namespace std;
 * int main() {
 *    cout << "Hello World" << endl;
 *    return 0;
 * }
 * ```
 * 
 * 第 1 行，跳过。
 * 第 2 ~ 行，原封不动的加入到结果里。
 * 第 N 行，停止循环，并跳过 。
 */
function compileCodeBlock(rows: string[], increment: () => number): string {
    let html = "";

    let code = "";
    let re = /```\s*?$/;

    for (let i = increment(), len = rows.length; i < len && !re.test(rows[i]);) {
        code += rows[i] + "\n";
        i = increment();
    }
    increment();

    html += `<pre><code>${escapeHTML(code)}</code></pre>`;

    return html;
}

/**
 * 
 * 编译表格
 * 没有匹配 `|:-:|` 此类的声明对齐方式
 */
function compileTable(rows: string[], nowIdx: number, increment: () => number): string {
    let html = "";

    let temp = "";
    let re = /^\|.*\|/;
    let arry, j, jlen;
    let thead = false;  // 默认第一行作为表头
    for (let i = nowIdx, len = rows.length; i < len && re.test(rows[i]); i = increment()) {
        arry = rows[i].split("|");
        temp += "<tr>";
        for (j = 1, jlen = arry.length - 1; j < jlen; j++) {
            if (thead === false) {
                temp += "<th>" + arry[j] + "</th>";
            } else {
                temp += "<td>" + arry[j] + "</td>";
            }
        }
        thead = true;
        temp += "</tr>";
    }
    html += "<table>" + temp + "</table>";

    return html;
}

/**
 * 如果什么都匹配不到，就是最简单的一行，仅处理行内标记
 */
function compileUnmatch(line: string): string {

    // 这部分代码用于防止出现空行 <p></p>
    // 尝试匹配所有空白字符串，如果空白字符串长度等于原长度，说明该行可以不予处理
    let re = /\s*/;
    let matchArr = line.match(re);
    if (matchArr![0].length == line.length) {
        return "";
    }

    // 处理行内 markdown 标记
    // let html = "";
    // if (formatMarkdown(line) !== "&nbsp;") {
    //     html += ;
    // }

    return `<p>${formatMarkdown(line)}</p>`;
}