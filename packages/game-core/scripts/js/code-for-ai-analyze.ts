import fs from 'fs'
import path from 'path'
export interface IFileAnalysis {
  filePath: string
  fileName: string
  relativePath: string
  directory: string
  lineCount: number
  docstringCount: number
  classCount: number
  methodCount: number
  methodsWithDocstring: number
  inlineCommentLines: number
  issues: string[]
}
export interface IProjectReport {
  statistics: {
    filesScanned: number
    filesWithDocstringPercent: string
    methodsWithDocstringPercent: string
    filesOver500Lines: number
    averageFileSize: number
  }
  priorityIssues: Record<string, any[]>
  missingDocstring: any[]
}
/**
 * 負責遍歷檔案系統並篩選目標 TypeScript 檔案
 */
export class FileScanner {
  constructor(private readonly rootDir: string) {}
  public scan(): string[] {
    return this.walk(this.rootDir)
  }
  private walk(currentPath: string): string[] {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })
    return entries.flatMap((entry) => {
      const fullPath = path.join(currentPath, entry.name)
      if (entry.isDirectory()) {
        return this.walk(fullPath)
      }
      return this.isTargetFile(entry.name) ? [fullPath] : []
    })
  }
  private isTargetFile(fileName: string): boolean {
    return fileName.endsWith('.ts') && !fileName.endsWith('.data.ts')
  }
}
/**
 * 負責單一檔案的語義與結構分析
 */
export class CodeAnalyzer {
  private readonly LARGE_FILE_THRESHOLD = 500
  private readonly COMMENT_RATIO_THRESHOLD = 0.15
  constructor(private readonly srcDir: string) {}
  public analyze(filePath: string): IFileAnalysis {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const relativePath = path.relative(this.srcDir, filePath)
    const analysis: IFileAnalysis = {
      filePath,
      fileName: path.basename(filePath),
      relativePath,
      directory: relativePath.split(path.sep)[0],
      lineCount: lines.length,
      docstringCount: (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length,
      classCount: (content.match(/^(export\s+)?(class|interface|type)\s+\w+/gm) || []).length,
      ...this.analyzeMethods(lines),
      inlineCommentLines: (content.match(/^\s*\/\/.*$/gm) || []).length,
      issues: [],
    }
    this.detectIssues(analysis)
    return analysis
  }
  private analyzeMethods(lines: string[]) {
    let methodCount = 0
    let methodsWithDocstring = 0
    lines.forEach((line, i) => {
      if (this.isMethodDeclaration(line)) {
        methodCount++
        if (this.hasLeadingDocstring(lines, i)) {
          methodsWithDocstring++
        }
      }
    })
    return { methodCount, methodsWithDocstring }
  }
  private isMethodDeclaration(line: string): boolean {
    return /^\s*(async\s+)?(\w+\s*\(|function\s+\w+|constructor\s*\()/.test(line)
  }
  private hasLeadingDocstring(lines: string[], index: number): boolean {
    const lookbackLines = lines.slice(Math.max(0, index - 15), index).join('\n')
    return /\/\*\*[\s\S]*?\*\/$/.test(lookbackLines.trim())
  }
  private detectIssues(analysis: IFileAnalysis): void {
    if (analysis.lineCount > this.LARGE_FILE_THRESHOLD) {
      analysis.issues.push('LARGE')
    }
    if (analysis.inlineCommentLines > analysis.lineCount * this.COMMENT_RATIO_THRESHOLD) {
      analysis.issues.push('COMMENTS')
    }
  }
}
/**
 * 負責將分析結果聚合為結構化報告
 */
export class ReportGenerator {
  public generate(analyses: IFileAnalysis[]): IProjectReport {
    return {
      statistics: this.calculateStats(analyses),
      priorityIssues: this.groupIssuesByLayer(analyses),
      missingDocstring: this.findMissingDocs(analyses),
    }
  }
  private calculateStats(analyses: IFileAnalysis[]) {
    const totalMethods = analyses.reduce((s, a) => s + a.methodCount, 0)
    const documentedMethods = analyses.reduce((s, a) => s + a.methodsWithDocstring, 0)
    return {
      filesScanned: analyses.length,
      filesWithDocstringPercent: this.toPercent(analyses.filter((a) => a.docstringCount > 0).length, analyses.length),
      methodsWithDocstringPercent: this.toPercent(documentedMethods, totalMethods),
      filesOver500Lines: analyses.filter((a) => a.lineCount > 500).length,
      averageFileSize: Math.round(analyses.reduce((s, a) => s + a.lineCount, 0) / analyses.length),
    }
  }
  private groupIssuesByLayer(analyses: IFileAnalysis[]) {
    const layers = ['domain', 'application', 'infra']
    return Object.fromEntries(
      layers.map((layer) => [
        layer,
        analyses
          .filter((a) => a.directory === layer && a.issues.length > 0)
          .map((a) => ({ file: a.fileName, issues: a.issues, lines: a.lineCount }))
          .sort((a, b) => b.lines - a.lines),
      ])
    )
  }
  private findMissingDocs(analyses: IFileAnalysis[]) {
    return analyses
      .filter((a) => a.methodCount > 0 && a.methodsWithDocstring === 0)
      .map((a) => ({ file: a.fileName, dir: a.directory, methods: a.methodCount }))
      .slice(0, 15)
  }
  private toPercent(n: number, total: number): string {
    return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : 'N/A'
  }
}
