import { Project, ReferencedSymbolEntry, Node } from 'ts-morph'
import * as ts from 'typescript'
import { writeFileSync } from 'fs'
import { relative } from 'path'
// npx ts-node scripts/extract-symbols.ts [outputFilePath]
interface SymbolInfo {
  name: string
  kind: string
  file: string
  usages: string[]
}
/* 建立專案實例 */
function createProject(): Project {
  return new Project({
    tsConfigFilePath: 'tsconfig.json',
  })
}
/* 檢查節點是否為目標符號種類 */
function isTargetSymbolKind(node: Node): boolean {
  return (
    node.isKind(ts.SyntaxKind.ClassDeclaration) ||
    node.isKind(ts.SyntaxKind.InterfaceDeclaration) ||
    node.isKind(ts.SyntaxKind.TypeAliasDeclaration) ||
    node.isKind(ts.SyntaxKind.EnumDeclaration) ||
    node.isKind(ts.SyntaxKind.FunctionDeclaration) ||
    node.isKind(ts.SyntaxKind.VariableDeclaration)
  )
}
/* 提取單個節點的符號資訊 */
function extractSymbolInfo(node: Node, sourceFilePath: string, project: Project): SymbolInfo {
  const name = (node as any).getName() || 'Unnamed' // 斷言為 any 以訪問 getName 方法
  const kind = node.getKindName()
  const file = relative(process.cwd(), sourceFilePath) // 轉為相對路徑
  const usages = project
    .getLanguageService()
    .findReferences(node)
    .flatMap((ref) => ref.getReferences().map((r: ReferencedSymbolEntry) => r.compilerObject.fileName))
    .filter((v, i, a) => a.indexOf(v) === i)
  return { name, kind, file, usages }
}
/* 從專案中提取所有符號 */
function extractSymbols(project: Project): SymbolInfo[] {
  const symbols: SymbolInfo[] = []
  project.getSourceFiles().forEach((sourceFile) => {
    sourceFile.forEachDescendant((node) => {
      if (isTargetSymbolKind(node)) {
        const symbolInfo = extractSymbolInfo(node, sourceFile.getFilePath(), project)
        symbols.push(symbolInfo)
      }
    })
  })
  return symbols
}
/* 生成 Markdown 表格內容 */
function generateMarkdownTable(symbols: SymbolInfo[]): string {
  let content = '| 名稱 | 種類 | 定義位置 | 使用位置 |\n'
  content += '|------|------|----------|----------|\n'
  symbols.forEach((symbol) => {
    content += `| ${symbol.name} | ${symbol.kind} | ${symbol.file} | ${symbol.usages.join(', ')} |\n`
  })
  return content
}
/* 寫入 Markdown 內容到文件 */
function writeMarkdownFile(content: string, filePath: string): void {
  writeFileSync(filePath, content, 'utf8')
  console.log(`符號表格已輸出到 ${filePath}`)
}
/* 解析命令行參數 */
function parseArguments(): { outputFilePath: string } {
  const args = process.argv.slice(2)
  const outputFilePath = args[0] || 'symbols.md'
  return { outputFilePath }
}
// 主體協調工具
function main(): void {
  const { outputFilePath } = parseArguments()
  const project = createProject()
  const symbols = extractSymbols(project)
  const markdownContent = generateMarkdownTable(symbols)
  writeMarkdownFile(markdownContent, outputFilePath)
}
main()
