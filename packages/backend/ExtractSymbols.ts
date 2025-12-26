import { Project, ReferencedSymbolEntry } from 'ts-morph'
import * as ts from 'typescript'
import { writeFileSync } from 'fs'

// 建立專案實例，載入 tsconfig.json
const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
})

// 符號陣列，儲存提取的資訊
const symbols: Array<{ name: string; kind: string; file: string; usages: string[] }> = []

// 遍歷所有來源檔案
project.getSourceFiles().forEach((sourceFile) => {
  sourceFile.forEachDescendant((node) => {
    // 檢查是否為目標節點種類
    if (
      node.isKind(ts.SyntaxKind.ClassDeclaration) ||
      node.isKind(ts.SyntaxKind.InterfaceDeclaration) ||
      node.isKind(ts.SyntaxKind.TypeAliasDeclaration) ||
      node.isKind(ts.SyntaxKind.EnumDeclaration) ||
      node.isKind(ts.SyntaxKind.FunctionDeclaration) ||
      node.isKind(ts.SyntaxKind.VariableDeclaration)
    ) {
      const name = node.getName() || 'Unnamed'
      const kind = node.getKindName()
      const file = sourceFile.getFilePath()
      // 查找引用並去重：展開 references，取檔案路徑
      const usages = project
        .getLanguageService()
        .findReferences(node)
        .flatMap((ref) => ref.getReferences().map((r: ReferencedSymbolEntry) => r.compilerObject.fileName)) // 修正：使用 compilerObject.fileName
        .filter((v, i, a) => a.indexOf(v) === i) // 去重使用位置
      symbols.push({ name, kind, file, usages })
    }
  })
})

// 生成 Markdown 內容
let markdownContent = '| 名稱 | 種類 | 定義位置 | 使用位置 |\n'
markdownContent += '|------|------|----------|----------|\n'
symbols.forEach((symbol) => {
  markdownContent += `| ${symbol.name} | ${symbol.kind} | ${symbol.file} | ${symbol.usages.join(', ')} |\n`
})

// 寫入到 symbols.md 文件
writeFileSync('symbols.md', markdownContent, 'utf8')
console.log('符號表格已輸出到 symbols.md')
