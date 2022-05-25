export function compileMarkdown(str: string): string {
    if (str == "") return "";

    // 一行一行的匹配
    let rows = str.split("\n");
    let matchArray;
    let html = "";
    for (let i = 0, len = rows.length; i < len; i++) {
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

            // 表格
            // ^\|.*\|：以 | 开头，匹配到 | 结束，中间无数个任意字符
            || rows[i].match(/^\|.*\|/);


        if (matchArray) {
            // ['## ', index: 0, input: '## 0x3f3f3f3f\r', groups: undefined]
            switch (matchArray[0]) {
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
                // 无法匹配多级引用，而且我也暂时用不到多级引用
                case "> ":
                    let blockquote = "";
                    let re1 = /^>\s/;
                    while (i < len && rows[i].match(re1)) {
                        blockquote += "<p>" + formatMarkdown(rows[i].substring(2, rows[i].length)) + "</p>";
                        i++;
                    }
                    html += `<blockquote>${blockquote}</blockquote>`;
                    break;

                // 匹配无序列表 * 无序列表
                case "* ":
                    let ul = "";
                    let re2 = /^\*\s/;
                    while (i < len && rows[i].match(re2)) {
                        ul += "<li>" + formatMarkdown(rows[i].substring(2, rows[i].length)) + "</li>";
                        i++;
                    }
                    html += `<ul>${ul}</ul>`;
                    break;

                // 匹配有序列表 1. 有序列表
                case rows[i].match(/^\d\.\s/) && rows[i].match(/^\d\.\s/)![0]:
                    let ol = "";
                    let re3 = /^\d\.\s/;
                    while (i < len && rows[i].match(re3)) {
                        ol += "<li>" + formatMarkdown(rows[i].substring(3, rows[i].length)) + "</li>";
                        i++;
                    }
                    html += `<ol>${ol}</ol>`;
                    break;

                // 匹配多行代码块
                case "```":
                    let code = "";
                    let re4 = /```\s*?$/;
                    i++;
                    while (i < len && !re4.test(rows[i])) {
                        code += rows[i] + "\n";
                        i++;
                    }
                    html += `<pre><code>${escapeHTML(code)}</code></pre>`;
                    break;

                // 匹配万恶的表格
                // 没有匹配 |:-:| 此类的声明对齐方式
                case rows[i].match(/^\|.*\|/) && rows[i].match(/^\|.*\|/)![0]:
                    let temp = "";
                    let re5 = /^\|.*\|/;
                    let arry, j, jlen;
                    let thead = false;
                    while (i < len && re5.test(rows[i])) {
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
                        i++;
                    }
                    html += "<table>" + temp + "</table>";
                    break;
            }
        } else {
            // 如果都匹配不到，就是最简单的一个 p
            // formatMarkdown(rows[i]) !== "&nbsp;" 防止出现空行
            let re = /\s*/;
            let matchArr = rows[i].match(re);
            if (matchArr![0].length == rows[i].length) {
                continue;
            }

            if (formatMarkdown(rows[i]) !== "&nbsp;") {
                html += `<p>${formatMarkdown(rows[i])}</p>`;
            }
        }
    }

    return html;
}

// 这个部分专门用于匹配行内可能出现的 Markdown 标记
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
    let code = str.match(/`.+`/g);
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

// 我当时在代码块里写了一个 #include <bits/stdc++.h>
// 它只给我显示 #include
// 给我干麻了
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
